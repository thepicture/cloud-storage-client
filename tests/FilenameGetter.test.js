const { FilenameGetter } = require('./../utils/FilenameGetter')

describe('FilenameGetter', () => {
  it('when the name is a and extension b then returns a.b', () => {
    const expected = 'a.b'
    const file = { name: 'a', extension: 'b' }

    const actual = FilenameGetter.getFileName(file)

    expect(actual).toBe(expected)
  })

  it('when the name is a and no extension then returns a', () => {
    const expected = 'a'
    const file = { name: 'a', extension: '' }

    const actual = FilenameGetter.getFileName(file)

    expect(actual).toBe(expected)
  })

  it('when there is no name and extension is b then returns .b', () => {
    const expected = '.b'
    const file = { name: '', extension: 'b' }

    const actual = FilenameGetter.getFileName(file)

    expect(actual).toBe(expected)
  })
})
