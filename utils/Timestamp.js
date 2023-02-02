class Timestamp {
  static nowAsSeconds() {
    return Math.floor(Date.now() / 1000)
  }

  static toMilliseconds(timestamp) {
    return timestamp * 1000
  }
}

module.exports = {
  Timestamp,
}
