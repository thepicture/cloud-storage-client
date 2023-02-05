const { Timestamp } = require('../../utils/Timestamp')

class FolderDatabase {
  constructor(db) {
    this.db = db
  }

  async getAllFolders(userEmail) {
    return await new Promise((resolve, reject) => {
      this.db.all(
        `SELECT JSON_OBJECT(
          'id', id,
          'name', title, 
          'createdAt', createdAt * 1000, 
          'owner', userEmail,
          'filesCount', (SELECT COUNT(id) FROM FILE WHERE folderId = folder.id),
          'totalSizeInBytes', (SELECT SUM(LENGTH(bytes)) FROM FILE WHERE folderId = folder.id)
         ) as record
           FROM FOLDER AS folder
          WHERE folder.userEmail = ?`,
        [userEmail],
        (err, results) => {
          if (err) {
            return reject(err)
          } else {
            const folders = results.map((entry) => JSON.parse(entry.record))

            resolve(folders)
          }
        }
      )
    })
  }

  renameFolderById({ folderId, newTitle }) {
    this.db.run(
      `UPDATE FOLDER
          SET title=?
        WHERE id=?`,
      [newTitle, folderId]
    )
  }

  deleteFolderById(folderId) {
    this.db.run(
      `DELETE FROM FOLDER
        WHERE id=?`,
      [folderId]
    )
  }

  async createFolder({ userEmail, title }) {
    return await new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO [FOLDER](title, createdAt, userEmail)
              VALUES (?, ?, ?)`,
        [title, Timestamp.nowAsSeconds(), userEmail],
        function (err) {
          if (err) {
            reject(err)
          } else {
            const id = this.lastID

            resolve(id)
          }
        }
      )
    })
  }
}

module.exports = {
  FolderDatabase,
}
