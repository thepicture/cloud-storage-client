const { Timestamp } = require('../../utils/Timestamp')

const DIRECT_LINK_HASH_SIZE = 32

class FileDatabase {
  constructor(db) {
    this.db = db
  }

  async getFilesFromFolder(folderId) {
    return await new Promise((resolve, reject) => {
      this.db.all(
        `SELECT id, 
                title         as 'name',
                extension,
                createdAt,
                deletedAt,
                LENGTH(bytes) as 'totalSizeInBytes', 
                folderId
           FROM FILE 
          WHERE folderId=?
            AND deletedAt IS NULL OR deletedAt > STRFTIME('%s', 'now')`,
        [folderId],
        (err, results) => {
          if (err) {
            reject(err)
          } else {
            resolve(results)
          }
        }
      )
    })
  }

  async getBytesById(fileId) {
    return await new Promise((resolve, reject) => {
      this.db.all(
        `SELECT HEX(bytes) as 'bytes'
           FROM FILE 
          WHERE id=?
          LIMIT 1`,
        [fileId],
        (err, results) => {
          if (err) {
            reject(err)
          } else {
            resolve(Buffer.from(results[0].bytes, 'hex'))
          }
        }
      )
    })
  }

  async getGeneratedDirectLink(fileId) {
    return await new Promise((resolve, reject) => {
      const hash = new Array(DIRECT_LINK_HASH_SIZE)
        .fill(null)
        .map(() =>
          String.fromCharCode(Math.floor(Math.random() * (122 - 97 + 1) + 97))
        )
        .join('')

      this.db.all(
        `INSERT INTO TEMPORARY_LINK ([hash], fileId)
              VALUES (?, ?)`,
        [hash, fileId],
        function (err) {
          if (err) {
            reject(err)
          } else {
            resolve(hash)
          }
        }
      )
    })
  }

  async getFileByHashLink(hashLink) {
    return await new Promise((resolve, reject) => {
      this.db.all(
        `SELECT HEX(bytes) as 'bytes'
           FROM TEMPORARY_LINK as tl
           JOIN FILE as f
             ON tl.fileId = f.id
          WHERE [hash] = ?`,
        [hashLink],
        (err, results) => {
          if (err) {
            reject(err)
          } else {
            resolve(Buffer.from(results[0].bytes, 'hex'))
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
          deletedAt === 0 ? null : deletedAt,
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
