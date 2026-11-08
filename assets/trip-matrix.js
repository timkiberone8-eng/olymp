(() => {
  const STREAM_COLS = 233;
  const STREAM_LEVELS = [0.3, 0.37, 0.44, 0.51];
  const FLICKER_CLASSES = 24;
  const ROWS = 7;

  function streamHash(a, b, k) {
    let x = (Math.imul(a, 374761393) + Math.imul(b, 668265263) + Math.imul(k, 1442695041)) | 0;
    x = Math.imul(x ^ (x >>> 13), 1274126177);
    return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
  }

  const streamWave = (() => {
    const raw = Array.from({ length: STREAM_COLS }, (_, i) => streamHash(i, 0, 5));
    const smooth = raw.map((_, i) => {
      let sum = 0;
      let weight = 0;
      for (let d = -5; d <= 5; d++) {
        const k = Math.exp(-(d * d) / 12.5);
        sum += raw[(i + d + STREAM_COLS) % STREAM_COLS] * k;
        weight += k;
      }
      return sum / weight;
    });
    const lo = Math.min(...smooth);
    const hi = Math.max(...smooth);
    return smooth.map(value => STREAM_LEVELS[Math.min(3, Math.floor((value - lo) / (hi - lo) * 4))]);
  })();

  class TripMatrix {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.palette = {};
      this.phase = 0;
    }

    resize(width, height, dpr) {
      this.width = width;
      this.height = height;
      this.dpr = dpr;
      this.canvas.width = Math.round(width * dpr);
      this.canvas.height = Math.round(height * dpr);
      this.cols = Math.max(48, Math.floor(width / 4));
      this.pitchX = width / this.cols;
      this.pitchY = height / ROWS;
      this.dotSize = Math.min(this.pitchX, this.pitchY) * 0.62;
      this.dots = Array.from({ length: this.cols }, (_, col) =>
        Array.from({ length: ROWS }, (_, row) => ({
          x: Math.round(((col + 0.5) * this.pitchX - this.dotSize / 2) * dpr) / dpr,
          y: Math.round(((row + 0.5) * this.pitchY - this.dotSize / 2) * dpr) / dpr,
          flicker: Math.floor(streamHash(col % 173, row, 302) * FLICKER_CLASSES)
        }))
      );
    }

    setPalette(palette) {
      this.palette = palette;
    }

    draw({ time, duration, trains, playing, speed, reducedMotion, finishWave }, now = performance.now()) {
      if (!this.width || !this.height) return;
      const ctx = this.ctx;
      const p = this.palette;
      const progress = Math.max(0, Math.min(1, time / duration));
      const head = progress * this.width;
      const done = time >= duration;
      if (playing && !reducedMotion) this.phase = Math.floor(now / 50);
      const phase = reducedMotion ? 0 : this.phase;
      const flicker = Array.from({ length: FLICKER_CLASSES }, (_, k) => {
        const hold = 2 + Math.floor(streamHash(k, 0, 13) * 5);
        const value = streamHash(k, Math.floor(phase / hold), 15);
        return value > 0.88 ? 0.64 : value > 0.64 ? 0.24 : 0;
      });

      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.clearRect(0, 0, this.width, this.height);
      ctx.globalAlpha = 1;
      const fill = ctx.createLinearGradient(0, 0, Math.max(1, head), 0);
      fill.addColorStop(0, 'transparent');
      fill.addColorStop(1, done && finishWave === 1 ? p.done : p.glow);
      ctx.fillStyle = fill;
      ctx.globalAlpha = 0.08;
      ctx.fillRect(0, 0, head, this.height);

      for (let col = 0; col < this.cols; col++) {
        const x = (col + 0.5) * this.pitchX;
        const passed = x <= head;
        const share = head ? x / head : 0;
        const wave = streamWave[(col + phase) % STREAM_COLS];
        const finished = done && x <= finishWave * this.width;
        for (const dot of this.dots[col]) {
          if (finished) {
            ctx.fillStyle = p.done;
            ctx.globalAlpha = 0.55 + wave * 0.7;
          } else if (passed) {
            const lift = flicker[dot.flicker] * Math.max(0, (share - 0.15) / 0.85);
            ctx.fillStyle = lift > 0.2 ? p.glow : p.trail;
            ctx.globalAlpha = Math.min(1, 0.28 + wave + Math.min(1, share / 0.67) * 0.12 + lift);
          } else {
            ctx.fillStyle = p.idle;
            ctx.globalAlpha = 0.82;
          }
          ctx.fillRect(dot.x, dot.y, this.dotSize, this.dotSize);
        }
      }
      ctx.globalAlpha = 1;

      for (let day = 1; day < duration; day++) {
        const x = this.width * day / duration;
        ctx.fillStyle = day <= time ? p.cursor : p.idle;
        ctx.globalAlpha = day <= time ? 0.55 : 0.7;
        ctx.fillRect(Math.round(x * this.dpr) / this.dpr, this.height / 2 - 3, 1, 6);
      }
      ctx.globalAlpha = 1;

      if (progress > 0 && !done) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, head, this.height);
        ctx.clip();
        const front = ctx.createLinearGradient(Math.max(0, head - 24), 0, head, 0);
        front.addColorStop(0, 'transparent');
        front.addColorStop(1, p.glow);
        ctx.fillStyle = front;
        ctx.globalAlpha = 0.18;
        ctx.fillRect(head - 24, 0, 24, this.height);
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = p.cursor;
        ctx.fillRect(Math.max(0, head - 1.5), 3, 1.5, this.height - 6);
        ctx.restore();
      }

      const met = trains.filter(train => train.t_meet <= time);
      for (const train of met) {
        const x = train.t_meet / duration * this.width;
        const color = train.group === 1 ? p.group1 : p.group2;
        const age = (time - train.t_meet) / duration * 16 / speed;
        if (playing && !reducedMotion && age < 0.32) {
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.2 * (1 - age / 0.32);
          ctx.fillRect(x - 5, 0, 10, this.height);
        }
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.moveTo(x, 4);
        ctx.lineTo(x, this.height - 4);
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.fillRect(x - 2.5, train.group === 1 ? 1 : this.height - 4, 5, 3);
      }
      ctx.globalAlpha = 1;
      const first = met.filter(train => train.group === 1).length;
      const label = `Прошло ${Math.round(progress * 100)}% пути. Встреч ${met.length}: ${first} поездов уже были в пути, ${met.length - first} выехали позже.`;
      if (this.canvas.getAttribute('aria-label') !== label) this.canvas.setAttribute('aria-label', label);
    }
  }

  window.TripMatrix = TripMatrix;
})();
