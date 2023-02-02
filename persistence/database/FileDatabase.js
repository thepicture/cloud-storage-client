const { Timestamp } = require('../../utils/Timestamp')

class FileDatabase {
  constructor(db) {
    this.db = db
  }

  async getFilesFromFolder(folderId) {
    return await new Promise((resolve, reject) => {
      this.db.all(
        `SELECT id, 
                title      as 'name',
                extension,
                createdAt,
                deletedAt,
                HEX(bytes) as 'bytes', 
                folderId
           FROM FILE 
          WHERE folderId=?`,
        [folderId],
        (err, results) => {
          if (err) {
            return reject(err)
          } else {
            results.forEach((file) => {
              file.bytes = file.bytes
                .match(/.{2}/g)
                .map((value) => parseInt(value, 16))
            })
            resolve(results)
          }
        }
      )
    })
  }

  async renameFile({ fileId, newTitle, newExtension = '' }) {
    this.db.run(
      `UPDATE FILE
          SET title=?,
              extension=?
        WHERE id=?
        LIMIT 1`,
      [newTitle, newExtension, fileId]
    )
  }

  async deleteFile(fileId) {
    this.db.run(
      `DELETE FROM FILE
        WHERE id=?
        LIMIT 1`,
      [fileId]
    )
  }

  async createFile({
    title,
    extension = '',
    deletedAt = null,
    bytes,
    folderId,
  }) {
    this.db.run(
      `INSERT INTO [FILE](title, extension, createdAt, deletedAt, bytes, folderId)
            VALUES (?, ?, ?, ?, ?, ?)`,
      [title, extension, Timestamp.nowAsSeconds(), deletedAt, bytes, folderId]
    )
  }
}

module.exports = {
  FileDatabase,
}
