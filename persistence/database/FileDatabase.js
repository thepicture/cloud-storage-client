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
              file.bytes = [...Buffer.from(file.bytes, 'hex')]
            })
            resolve(results)
          }
        }
      )
    })
  }

  renameFileById({ fileId, newTitle, newExtension = '' }) {
    this.db.run(
      `UPDATE FILE
          SET title=?,
              extension=?
        WHERE id=?`,
      [newTitle, newExtension, fileId]
    )
  }

  deleteFileById(fileId) {
    this.db.run(
      `DELETE FROM FILE
        WHERE id=?`,
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
    return await new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO [FILE](title, extension, createdAt, deletedAt, bytes, folderId)
              VALUES (?, ?, ?, ?, ?, ?)`,
        [
          title,
          extension,
          Timestamp.nowAsSeconds(),
          deletedAt,
          Buffer.from(bytes),
          folderId,
        ],
        function (err) {
          if (err) {
            reject(err)
          } else {
            resolve(this.lastID)
          }
        }
      )
    })
  }
}

module.exports = {
  FileDatabase,
}
