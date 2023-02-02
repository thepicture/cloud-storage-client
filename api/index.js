const sqlite3 = require('sqlite3')

const fs = require('fs')

const bodyParser = require('body-parser')

const app = require('express')()

const { FolderDatabase } = require(__dirname + '/../persistence')
const { FileDatabase } = require(__dirname + '/../persistence')

const scriptPath = __dirname + '/../migrations/initialize.sql'
const databasePath = __dirname + '/../databases/storage.db'

let db = new sqlite3.Database(
  databasePath,
  sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE,
  function (err) {
    if (err) {
      console.log(__dirname)
      console.log(err)
    }
  }
)

db.serialize(() => {
  if (fs.existsSync(databasePath)) {
    fs.unlinkSync(databasePath)
  }

  const script = fs.readFileSync(scriptPath, 'utf-8')

  db.exec(script)
})

const folderDatabase = new FolderDatabase(db)
const fileDatabase = new FileDatabase(db)

app.use(bodyParser.json())

app.all('/folders/:userEmail', async (req, res) => {
  try {
    const folders = await folderDatabase.getAllFolders(req.params.userEmail)

    res.json({ folders })
  } catch (error) {
    res.json({ error })
  }
})

app.all('/files', async (req, res) => {
  try {
    const folderId = Number(req.query['folder_id'])
    const files = await fileDatabase.getFilesFromFolder(folderId)

    res.json({ files })
  } catch (error) {
    res.json({ error })
  }
})

module.exports = app
