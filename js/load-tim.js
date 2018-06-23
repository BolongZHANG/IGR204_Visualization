var countries = []
var activities = []
var dataset = new Map()

//exemple d'accès au dataset : dataset.get("Belgium").get("Sleep").participationTime ; dataset.get("Belgium").get("Sleep").participationRate ; dataset.get("Belgium").get("Sleep").timeSpent

d3.csv('data/label.csv', function (label) {
  for (var i = 13; i < 34; i++) {
    countries.push(label[i]['DATASET: Time spent, participation time and participation rate in the main activity by sex and day of the week [tus_00week]'])
  };
  for (var i = 46; i < 101; i++) {
    activities.push(label[i]['DATASET: Time spent, participation time and participation rate in the main activity by sex and day of the week [tus_00week]'])
  };

  for (var i = 0; i < countries.length; i++) {
    var map = new Map()
    for (var j = 0; j < activities.length; j++) {
      var objet = { participationTime: 0, participationRate: 0, timeSpent: 0 }
      map.set(activities[j], objet)
    }
    dataset.set(countries[i], map)
  }
})

d3.csv('data/data.csv', function (error, data) {
  for (var i = 0; i < data.length; i++) {
    l = data[i]
    if ((l.DAYSWEEK === 'All days of the week') && (l.SEX === 'Total') && (l.ACL00 != 'Total')) {
      if (l.UNIT === 'Time spent (hh:mm)') {
        dataset.get(l.GEO).get(l.ACL00).timeSpent = l.Value
      }
      if (l.UNIT === 'Participation time (hh:mm)') {
        dataset.get(l.GEO).get(l.ACL00).participationTime = l.Value
      }

      if (l.UNIT === 'Participation rate (%)') {
        dataset.get(l.GEO).get(l.ACL00).participationRate = l.Value
      }
    }
  }
  create_list_activities_ts()
	create_list_activities_pt()	
	createNewGRAPHsvg()
	
	$('#participation_time_li').trigger('click')
	plotGraphActivity(activities[0])
	$('#time_spent_li').trigger('click')
})
