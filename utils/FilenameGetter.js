export class FilenameGetter {
  static getFileName(file) {
    if (file.extension) {
      return `${file.name}.${file.extension}`
    } else {
      return file.name
    }
  }
}
