export class FileURI {
  constructor(filename) {
    this.filename = filename
  }

  getValues() {
    const parts = this.filename.split('.')

    if (parts.filter((part) => !!part).length === 1) {
      return [this.filename, '']
    } else {
      return [parts.slice(0, -1).join('.'), parts.pop()]
    }
  }
}
