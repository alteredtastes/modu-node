module.exports = {
  //user routes
  findUsers: require('./find.users'),
  getUserDash: require('./get.user.dash'),

  //user subdirectories
  calendar: require('./calendar/calendar.subroutes.js')
}
