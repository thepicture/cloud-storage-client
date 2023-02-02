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

app.get('/folders/:userEmail', async (req, res) => {
  try {
    const folders = await folderDatabase.getAllFolders(req.params.userEmail)

    res.json({ folders })
  } catch (error) {
    res.status(500).json({
      error: [error.toString()],
    })
  }
})

app.all('/files', async (req, res) => {
  try {
    const folderId = Number(req.query['folder_id'])
    const files = await fileDatabase.getFilesFromFolder(folderId)

    res.json({ files })
  } catch (error) {
    res.status(500).json({
      error: [error.toString()],
    })
  }
})

app.delete('/folders/:folderId', async (req, res) => {
  try {
    const folderId = Number(req.params.folderId)

    folderDatabase.deleteFolderById(folderId)

    res.sendStatus(200)
  } catch (error) {
    res.status(500).json({
      error: [error.toString()],
    })
  }
})

app.patch('/folders/:folderId', async (req, res) => {
  try {
    const folderId = Number(req.params.folderId)
    const { newTitle } = req.body

    if (!newTitle) {
      res.status(422).json({
        error: ['title is required'],
      })
    }

    folderDatabase.renameFolderById({
      folderId,
      newTitle,
    })

    res.sendStatus(204)
  } catch (error) {
    res.status(500).json({
      error: [error.toString()],
    })
  }
})

app.post('/folders', async (req, res) => {
  try {
    const { title, userEmail } = req.body

    if (!title) {
      res.status(422).json({
        error: ['title is required'],
      })
    }

    if (!userEmail) {
      res.status(422).json({
        error: ['user email is required'],
      })
    }

    const id = await folderDatabase.createFolder({
      title,
      userEmail,
    })

    console.log(id)

    res.status(201).json({ id })
  } catch (error) {
    res.status(500).json({
      error: [error.toString()],
    })
  }
})

module.exports = app
