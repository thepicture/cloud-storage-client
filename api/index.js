const sqlite3 = require('sqlite3')

const fs = require('fs')

const bodyParser = require('body-parser')

const app = require('express')()

const cors = require('cors')

const { MigrationRunner } = require(__dirname + '/../utils/MigrationRunner')

const { FolderDatabase } = require(__dirname +
  '/../persistence/database/FolderDatabase')
const { FileDatabase } = require(__dirname +
  '/../persistence/database/FileDatabase')

const { TWENTY_MEGABYTES } = require(__dirname + '/../config/index')

const migrationsPath = __dirname + '/../migrations'

const databasePath = __dirname + '/../databases/storage.db'

let db = new sqlite3.Database(
  ':memory:',
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

  const runner = new MigrationRunner(db)
  runner.runFromFolder(migrationsPath)
})

const folderDatabase = new FolderDatabase(db)
const fileDatabase = new FileDatabase(db)

app.use(
  bodyParser.json({
    limit: '20mb',
  })
)

app.use(
  cors({
    origin: true,
    credentials: true,
  })
)

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

app.post('/files/:fileId/generate-direct-link', async (req, res) => {
  try {
    const fileId = Number(req.params['fileId'])
    const directLink = await fileDatabase.getGeneratedDirectLink(fileId)

    res.json(directLink)
  } catch (error) {
    res.status(500).json({
      error: [error.toString()],
    })
  }
})

app.get('/files/:hashLink/:fileName', async (req, res) => {
  try {
    const { hashLink } = req.params
    const buffer = await fileDatabase.getFileByHashLink(hashLink)

    res.setHeader('Content-Type', `application/octet-stream"`)
    res.send(buffer)
  } catch (error) {
    res.status(404).json({
      error: [error.toString()],
    })
  }
})

app.get('/files/download/:fileId/:filename', async (req, res) => {
  try {
    const fileId = Number(req.params['fileId'])
    const buffer = await fileDatabase.getBytesById(fileId)

    res.setHeader('Content-Type', `application/octet-stream"`)
    res.send(buffer)
  } catch (error) {
    res.status(500).json({
      error: [error.toString()],
    })
  }
})

app.get('/files', async (req, res) => {
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

app.delete('/files/:fileId', async (req, res) => {
  try {
    const fileId = Number(req.params.fileId)

    fileDatabase.deleteFileById(fileId)

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

app.patch('/files/:fileId', async (req, res) => {
  try {
    const fileId = Number(req.params.fileId)
    const { newTitle, newExtension } = req.body

    if (!newTitle) {
      res.status(422).json({
        error: ['title is required'],
      })
    }

    if (newExtension && newExtension === 'php') {
      res.status(422).json({
        error: ['php extension is prohibited'],
      })
    }

    fileDatabase.renameFileById({
      fileId,
      newTitle,
      newExtension,
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

    res.status(201).json(id)
  } catch (error) {
    res.status(500).json({
      error: [error.toString()],
    })
  }
})

app.post('/files', async (req, res) => {
  try {
    const { title, extension, deletedAt, bytes, folderId } = req.body

    if (!title) {
      res.status(422).json({
        error: ['title is required'],
      })
    }

    if (!bytes || bytes.length === 0) {
      res.status(422).json({
        error: ['file content cannot be empty'],
      })
    }

    if (folderId <= 0) {
      res.status(422).json({
        error: ['folder should exist'],
      })
    }

    if (bytes.length > TWENTY_MEGABYTES) {
      res.status(422).json({
        error: ['file size should be <= 20mb'],
      })
    }

    const id = await fileDatabase.createFile({
      title,
      extension,
      deletedAt,
      bytes,
      folderId,
      deletedAt,
    })

    res.status(201).json(id)
  } catch (error) {
    res.status(500).json({
      error: [error.toString()],
    })
  }
})

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}...`)
})
