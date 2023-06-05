export class WarningHandler {
  warnings = [];
  generateWarning(message) {
    console.warn(message);
    this.warnings.push(message);
  }
  printWarnings() {
    const warningCount = this.warnings.length;
    if (warningCount === 0) {
      return;
    }
    if (typeof alert === 'function') {
      if (warningCount > 15) {
        alert(`${warningCount} warnings generated.\n${this.warnings.slice(0, 10).join('\n')}\n+${warningCount - 10} more\nCheck console for details.`);
      } else {
        alert(`${warningCount} warning${warningCount === 1 ? '' : 's'} generated.\n` + this.warnings.join('\n'));
      }
    }
    this.warnings.length = 0;
  }
}

export const defaultWarningHandler = new WarningHandler();

export default WarningHandler;