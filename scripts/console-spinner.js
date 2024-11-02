export default class {
  constructor() {
    this.spinnerChars = ['-', '\\', '|', '/'];
    this.currentIndex = 0;
    this.interval = null;
    this.message = null
  }

  start(message) {
    if (this.interval) return; // 既に実行中の場合は何もしない

    this.message  = message
    this.interval = setInterval(() => {
      process.stdout.write(`\r${this.spinnerChars[this.currentIndex]} ${message}`);
      this.currentIndex = (this.currentIndex + 1) % this.spinnerChars.length;
    }, 200); // 200msごとにスピナーを更新
    // process.stdout.write('\n'); // 改行を追加して次のログが新しい行に出力されるようにする
  }

  stop(message) {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      process.stdout.write(`\r${message}\n`); // スピナーをメッセージで置き換え、改行を追加
    }
  }
}
