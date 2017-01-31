/*
    MarkTogether Utils

    Utils For MarkTogether
    0xFireball and Joonatoona from CookieEaters (https://cookieeaters.xyz).

    This code is licensed under the Apache License 2.0
*/

/* jshint esversion: 6 */

// Thank you http://stackoverflow.com/questions/18405736/is-there-a-c-sharp-string-format-equivalent-in-javascript
String.prototype.format = function () {
  var args = arguments
  return this.replace(/{(\d+)}/g, function (match, number) {
    return typeof args[number] !== 'undefined' ? args[number] : match
  })
}

// Thank you StackOverflow! :D
function getParameterByName (name, url) {
  if (!url) url = window.location.href
  name = name.replace(/[\[\]]/g, '\\$&')
  let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url)
  if (!results) return null
  if (!results[2]) return ''
  return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

// jQuery for page scrolling feature - requires jQuery Easing plugin
$(function () {
  $('a.page-scroll').bind('click', function (event) {
      var $anchor = $(this)
      $('html, body').stop().animate({
          scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo')
      event.preventDefault()
    })
})

// Display a message :D
function displayMessage (messageName, messageValue, alertType) {
  $('#message-target').prepend(`<div class="alert alert-dismissible alert-{0}">
                        <button type="button" class="close" data-dismiss="alert">×</button>
                        <h4>{1}</h4>
                        <p>{2}</p>
                    </div>`.format(alertType, messageName, messageValue))
}

// Pull messages from JSON file and display them
function displayAnnouncements () {
  $.getJSON('data/announce.json', function (data) {
    let items = []
    $.each(data, function (alertType, alertsInCategory) {
      $.each(alertsInCategory, function (messageName, messageValue) {
        displayMessage(messageName, messageValue, alertType)
      })
    })
  })
}

function saveFile (data, filename) {
  let blob = new Blob([data], {
    type: 'text/plain;charset=utf-8'
  })
  saveAs(blob, filename)
}
