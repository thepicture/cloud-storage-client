const fs = require('fs')

class MigrationRunner {
  constructor(db) {
    this.db = db
  }

  async runFromFolder(folder) {
    fs.readdirSync(folder)
      .map((fileName) => ({
        name: fileName,
        time: fs.statSync(`${folder}/${fileName}`).birthtime.getTime(),
        script: fs.readFileSync(`${folder}/${fileName}`, 'utf-8'),
      }))
      .sort((a, b) => a.time - b.time)
      .forEach((file) => {
        console.log(`running migration ${file.name}...`)

        this.db.exec(file.script)

        console.log(`migration ${file.name} executed!`)
      })
  }
}

module.exports = { MigrationRunner }
