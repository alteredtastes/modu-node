module.exports.artist = {
  findArtists: require('./artist/find.artists'),
  findArtistById: require('./artist/find.artist.by.id'),
  insertArtist: require('./artist/insert.artist'),
  updateArtist: require('./artist/update.artist'),
  deleteArtist: require('./artist/delete.artist'),
  selections: require('./artist/selections')
}

module.exports.work = {
  findWorks: require('./work/find.works'),
  findWorkById: require('./work/find.work.by.id'),
  insertWork: require('./work/insert.work'),
  updateWork: require('./work/update.work'),
  deleteWork: require('./work/delete.work')
}
