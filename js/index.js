// TODO: Get SMooth Scrolling working https://codepen.io/ifen/pen/ejcty?editors=0100
//        - Infinite Scroll sucks, redo
//        - Project Page routing
var app = {
  client: null,
  winh: null,
  winw: null,
  bodyh: null,
  projectSpacer: null,
  lastPosition: null,
  scroll: null,
  contentWidth: null,
  globalSeconds: null,
  projectData: [],
  currentProject: {},
  $singlePage: [],
  $title: [],
  $description: [],
  $images: [],
  $roles: [],
  $credits: [],
  init: function () {
    var self = this

    self.client = contentful.createClient({
      accessToken: '751eb90638512801ed48bcb8c431c20874c2edd067426e3e19428720a0d2ae7f',
      space: 'a72w7g4zs2xs'
    })

    // set animation lengths
    self.globalSeconds = 0.25

    self.$singlePage = $('.single-project')
    self.$title = self.$singlePage.find('.title')
    self.$description = self.$singlePage.find('.description')
    self.$images = self.$singlePage.find('.images')
    self.$roles = self.$singlePage.find('.roles')
    self.$credits = self.$singlePage.find('.credits')

    // Functions
    self.getProjects()
  },
  isHome: function () {
    // used for infinite scroll
    // console.log(!$('.single-project').is(':visible'))
    return !$('.single-project').is(':visible')
  },
  getProjects: function () {
    var self = this

    self.client.getEntries({
      'content_type': 'project'
    }).then(
      function (response) {
        self.projectData = response.items
        // console.log(self.projectData)

        self.buildProjects()
      },
      function (response) {
        console.log('fail')
        // console.log(response);
      }
    )
  },
  handleGetProject: function (targetID) {
    var self = app
    // console.dir(self.projectData)
    // loop through all project data until we have a match
    // Only one call is made to contentful
    for (var i = 0; i < self.projectData.length; i++) {
      var thisId = self.projectData[i].sys.id
      if (thisId === targetID) {
        self.currentProject = self.projectData[i]
        // console.dir(self.currentProject)
        break
      }
    }

    self.buildProject()
  },
  handleGoHome: function () {
    var self = app

    self.animProjectClose()
  },
  locationRead: function () {
      var self = this

      var currentLocation = window.location.hash

      if (currentLocation) {
        var el = $('.projects [data-location="' + currentLocation + '"]')[0]
        self.handleGetProject().bind(el)
      }
  },
  locationWrite: function () {
    var self = this
    // console.log(self.currentProject)
    var el = $('[data-project-id="' + self.currentProject.sys.id + '"]')

    // var url = window.origin
    var url = window.origin + window.pathname // Temporary Until Live
    newLocation = el.attr('data-location')

    window.location = url + '#' + newLocation
  },
  clearProject: function() {
    var self = this

    self.$title.html('')
    self.$roles.html('')
    self.$description.html('')
    self.$credits.html('')
    self.$images.html('')

  },
  buildProjects: function (){
    var self = this

    // console.log(self.projectData)
    var projects = self.projectData
    var $projectComponent = $('ul.projects')
    var $projectPageComponent = $('.single-project')

    for (var i = 0; i < projects.length; i++) {
      var project = projects[i].fields
      var id = projects[i].sys.id
      var roles = project.roles.join(' / ')
      var thumb = project.previewThumbnail.fields.file.url
      var output = '<li class="project" data-location="' + i + '" data-project-id="' + id + '">' +
        '<div class="project-wrapper">' +
          '<h1 class="outline">' + project.title + '</h1>' +
          '<h2 class="subhead roles">' + roles + '</h2>' +
          '<img class="thumb" src="' + thumb + '" alt="" />' +
        '</div>' +
      '</li>'
      $projectComponent.append(output)
    }

    for (var i = 0; i < projects.length; i++) {
      var projectItem = projects[i].fields
      var id = projects[i].sys.id
      var roles = projectItem.roles.join(' / ')
      var thumb = projectItem.previewThumbnail.fields.file.url
      var output = '<li class="project" data-location="' + i + '" data-project-id="' + id + '">' +
        '<div class="project-wrapper">' +
          '<h1 class="outline">' + projectItem.title + '</h1>' +
          '<h2 class="subhead">' + roles + '</h2>' +
          '<img class="thumb" src="' + thumb + '" alt="" />' +
        '</div>' +
      '</li>'
      $projectComponent.append(output)
      if (i === 4) {
        // console.log($('ul.projects li').length)
        break
      }
    }
    self.resizeRefresh()
    self.bindListeners()
    // self.locationRead()
  },
  buildProject: function () {
    var self = this
    // console.log(self.currentProject);

    var roles = self.currentProject.fields.roles.join(' / ')
    var title = self.currentProject.fields.title
    var desc = self.currentProject.fields.description
    var credits = self.currentProject.fields.projectCredits

    // markdown
    if ( desc ) desc = marked(desc)
    if ( credits ) credits = marked(credits)

    self.$title.html('').html(title)
    self.$roles.html('').html(roles)
    self.$description.html('').html(desc)
    self.$credits.html('').html(credits)
    self.$images.html('')

    // Begin Row Loop
    console.log(self.currentProject.fields)
    for (var i = 0; i < self.currentProject.fields.assets.length; i++) {
      var thisItem = self.currentProject.fields.assets[i]
      var dropShadow = ''
      var imgURL = ''
      var mobileImgURL = ''
      var vimID = ''
      var row = ''
      var img = ''
      var mobileImg = ''
      var vim = ''
      var mockupMobile = ''

      // Define Row Layout
      var rowClass = 'oneAsset'

      // register Asset Namespaces
      var fields = thisItem.fields
      // console.log(i)

      if (fields.vimId && fields.vimId !== 'undefined') vimID = fields.vimId
      if (fields.photo && fields.photo !== 'undefined') imgURL = fields.photo.fields.file.url
      if (fields.mockupMobile && fields.mockupMobile != 'undefined') {
        mockupMobile = fields.mockupMobile
        mobileImgURL = mockupMobile.fields.file.url
      }

      if (vimID) {

        rowClass = 'video'
        vim = '<div class="overlay" data-vimeoid="' + vimID + '">' +
                // '<iframe src="http://player.vimeo.com/video/' + vimID + '?api=1&player_id=video" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen id="video"></iframe>' +
                '<div class="playpause start"></div>' +
              '</div>'

      } else if (imgURL) {
        if (fields.applyDropShadow) dropShadow = fields.applyDropShadow

        img = '<img data-shadow="' + dropShadow + '" src="' + imgURL + '"/>'

        if (mobileImgURL) {
          rowClass = 'twoUp'
          mobileImg = '<img data-shadow="' + dropShadow + '" src="' + mobileImgURL + '"/>'
        }
      }

      row = '<div class="' + rowClass + '">' + img + mobileImg + vim + '</div>'

      self.$images.append(row)
    }

    // initialize lazySizes
    lazySizes.init();

    // initialize vimeos
    $('.video .overlay').each(function (){
      self.vimeoHandler(this)
    })

    // Defer sticky until content is loaded
    // $(document).one('load', function () {
    //     // console.log('done')
    //     debugger
    // })
    self.animProjectOpen()
  },
  stickyContent: function (){
    var self = this
    self.contentWidth = self.$singlePage.find('.content-wrapper').width()
    $('.single-project .content').width(self.contentWidth)
    // debugger
  },
  resizeRefresh: function () {
    var self = this

    self.contentWidth = self.$singlePage.find('.content-wrapper').width()
    self.winh = $(window).height()
    self.winw = $(window).width()
    self.bodyh = $('.container').height()
    self.projectSpacer = self.winh / 6
    $('.project').css('margin-bottom', self.projectSpacer)
    $('.wrapper').height($('.smooth').height());

    // Resize the sticky content
    self.stickyContent()

    self.infiniteScroll()
  },
  infiniteScroll: function () {
    var self = this

    $(window).scroll(function () {
      var offset = self.bodyh - self.winh - 50
      var st = $(window).scrollTop()
      if (st >= offset && self.isHome()) { $(window).scrollTop(0) }
      // console.log( st + ' and ' + offset)
    })
  },
  bindListeners: function () {
    var self = this

    $(window).resize(self.resizeRefresh())

    $('.project').hover(function () {
      self.positionThumb(this)
    })

    $('li.project').on('click', function () {
      var targetID = $(this).data('project-id')
      self.handleGetProject(targetID)
    })

    $('.home').on('click', self.handleGoHome)
  },
  animProjectOpen: function () {
    var self = this
    var tl = new TimelineLite()
    var t = self.globalSeconds
    var imagesArr = self.$images.find('> *')
    var contentArr = self.$singlePage.find('.content > *')

    tl
      .staggerTo('ul.projects li', t, {
        opacity: 0
      }, t / 4)
      .set('ul.projects', {
        display: 'none'
      })
      // setup project visibility
      .set([contentArr, imagesArr, '.back'], {
        opacity: 0
      })
      .set('.single-project', {
        display: 'block'
      })
      // Adjust widths
      .call( function () {
        $(window).scrollTop(0)
        self.stickyContent()
      })
      // Project Reveal
      .staggerTo([contentArr, imagesArr, '.back'], t, {
        opacity: 1,
        delay: t
      }, t*0.9)
  },
  animProjectClose: function () {
    var self = this
    var tl = new TimelineLite()
    var t = self.globalSeconds
    var delay = t * 3

    tl
      .staggerTo('.single-project img, .single-project .content, .back', t, {
        opacity: 0
      }, -t / 10)
      .set('.single-project', {
        display: 'none'
      })
      .set('.single-project img, .single-project .content', {
        opacity: 1
      })
      .call( function () {
        $(window).scrollTop(0)
        self.clearProject();
      })
      // Home Reveal
      .set('ul.projects li', {
        opacity: 0
      })
      .set('ul.projects', {
        display: 'block',
        opacity: 1
      })
      .to('ul.projects li', t, {
        opacity: 1,
        delay: delay
      })
  },
  vimeoHandler: function (el) {
    var id = $(el).attr('data-vimeoid')

    var options = {
        id: id,
        width: 640
    }
    var player = new Vimeo.Player(el, options)
    // debugger
    player.ready().then(function () {
      player.on('ended', onFinish)
    })
    $('.playpause').click(function () {
      player.getPaused().then(function (paused) {
        if (!paused) {
          player.pause()
          $('.playpause').removeClass('pause')
        } else {
          player.play()
          $('.playpause').addClass('pause')
        }
      })
    })
    function onFinish (id) {
      $('.playpause').removeClass('pause')
    }
  },
  // Utilities
  getRandom: function (min, max) {
    return Math.random() * (max - min) + min
  },
  positionThumb: function (project) {
    var self = this
    var thumb = $(project).find('.thumb')
    var index = 1 / (($(project).index() % 2) + 1)
    var thumbH = thumb.height()
    var thumbW = thumb.width()
    var randX = (index == 1) ? '-100%' : 0
    TweenMax.set(thumb, {
      x: randX
    })
  }
}

$(window).load(function () {
  app.init()
});
