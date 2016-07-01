(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function arm (options) {
  var nodes = []
  var links = []
  var n_arms = options.n_arms
  var count = options.count

  var n_segments = n_arms * count

  console.log('n_arms', n_arms)
  console.log('segments_per_arm', count)
  console.log('total_segments', n_segments)

  for (var i = 0; i < n_segments; i++) {
    nodes.push({
      name: i,
      type: 'na',
      do_link: (i < (n_segments - 1)) &&
        ((i % count) !== (count - 1)) &&
        i >= 0
    })
    // console.log(i, i % count, (
    //   (i < (n_segments - 1))
    //   && ((i % count) !== (count - 1))
    //   && i >= 0
    //   ))
    if ((i < (n_segments - 1)) &&
      ((i % count) !== (count - 1)) &&
      i >= 0
    ) {
      links.push({
        source: i,
        target: i + 1,
        value: i % count
      })
    }
  }
  var d3 = window.d3

  var simulation = d3.forceSimulation()
    .velocityDecay(0.01)
    .force('link', d3.forceLink().id(function (d) { return d.name })
      .distance(function (d, i) { return (count - (i % count) + 1) * options.distance })
  )
    .force('many', d3.forceManyBody().strength(-3))
    // .force('center', d3.forceCenter().x(500).y(250))

  simulation.nodes(nodes)
  simulation.force('link').links(links)

  window.s = simulation

  nodes.forEach(function (node, idx) {
    var av = 100
    var v = 1.0
    node.x = (window.innerWidth * 0.5) + (Math.random() * av) - (av * 0.5)
    node.y = (window.innerHeight * 0.5) + (Math.random() * av) - (av * 0.5)
    node.vx += (Math.random() * v) - (v * 0.5)
    node.vy += (Math.random() * v) - (v * 0.5)
  })

  var svg = options.parent

  var random_range_distance = 30
  var offset_x = (Math.random() * random_range_distance) - (random_range_distance * 0.5)
  var offset_y = (Math.random() * random_range_distance) - (random_range_distance * 0.5)

  svg = svg.append('g')
    .attr('transform', 'translate(' + offset_x + ' ' + offset_y + ')')

  var line_generator = d3.line()
    .x(function (d) { return d.x })
    .y(function (d) { return d.y })
    .curve(d3.curveCatmullRom.alpha(1.0))

  var data = []
  var link

  if (window.use_path === true) {
    nodes.forEach(function (node) {
      data.push({ x: node.x, y: node.y })
    })
    link = svg.append('path')
      .datum(data)
      .attr('d', line_generator)
      .attr('class', 'link')
      .attr('stroke', 'black')
      .attr('fill', 'none')
      .attr('stroke-linecap', 'round')
      .style('stroke-opacity', 1.0)
      .style('stroke-width', 3)
  } else {
    link = svg.selectAll('.link')
      .data(links)
      .enter().append('line')
      .attr('class', 'link')
      .attr('stroke', 'black')
      .attr('fill', 'none')
      .attr('stroke-linecap', 'round')
      .style('stroke-opacity', 1.0)
      .style('stroke-width', function (d, i) {
        // console.log(d.value, i, count - d.value)
        return (count - d.value) * 3
      })
  }

  var node = svg.selectAll('.node')
    .data(nodes)
    .enter().append('g').attr('class', 'node')

  return {
    simulation: simulation,
    link: link,
    links: links,
    node: node,
    line_generator: line_generator,
    data: data,
    count: count,
    n_arms: n_arms
  }
}

},{}],2:[function(require,module,exports){
console.log('hello from the kraken!')

var d3 = window.d3

// screen space variable setup
var w = window.innerWidth
var h = window.innerHeight

// handle resize events
window.addEventListener('resize', function () {
  console.log('resize')
  w = window.innerWidth
  h = window.innerHeight
  svg.attr('viewBox', '0 0 ' + w + ' ' + h)
    .attr('width', w)
    .attr('height', h)
  rect_bg.attr('width', w)
    .attr('height', h)
})

var div_kraken = d3.select('div#kraken')
var svg = div_kraken.append('svg')
  .attr('viewBox', '0 0 ' + w + ' ' + h)
  .attr('width', w)
  .attr('height', h)
  .attr('preserveAspectRatio', 'xMidYMid')

var defs = svg.append('defs')

var filter_depth = defs.append('filter')
  .attr('id', 'depth-blur')
  .append('feGaussianBlur').attr('in', 'SourceGraphic').attr('stdDeviation', 10)

var bg_radial_gradient = defs.append('radialGradient').attr('id', 'gradient-bg')

bg_radial_gradient.append('stop').attr('offset', '0%').attr('stop-color', 'rgb(0,0,10)')
var bg_stop_1 = bg_radial_gradient.append('stop').attr('offset', '100%').attr('stop-color', 'rgb(0,0,50)')

var bg_linear_gradient = defs.append('linearGradient')
  .attr('id', 'linear-gradient-bg')
  .attr('gradientTransform', 'rotate(90)')

var linear_bg_stop_0 = bg_linear_gradient.append('stop').attr('offset', '0%').attr('stop-color', 'rgb(0,0,50)')
var linear_bg_stop_1 = bg_linear_gradient.append('stop').attr('offset', '90%').attr('stop-color', 'rgb(0,0,10)')

// add background rectangle
var rect_bg = svg.append('rect').attr('x', 0).attr('y', 0).attr('width', w).attr('height', h).attr('fill', 'url(#linear-gradient-bg)')

var circle_target = svg.append('circle')
  .attr('cx', w * 0.5)
  .attr('cy', h * 0.5)
  .attr('r', 100)
  .attr('filter', 'url(#depth-blur)')
  .attr('fill', 'red')
  .attr('opacity', 0)

var fade_in_duration = 10000
filter_depth.transition().attr('stdDeviation', 3).duration(fade_in_duration)
// circle_target.transition().attr('opacity', 1).duration(fade_in_duration)

function fade_bg (a) {
  var v = Math.min(255 - Math.floor((kraken_head.y / h) * 220), 150)
  console.log('fading to', v)
  a.transition()
    .duration(2000)
    .attr('stop-color', 'rgb(0,0,' + v + ')')
    .on('end', function () {
      fade_bg(a)
    })
}

var target_points

svg.on('click', function () {
  // attract the kraken head
  d3.event.preventDefault()
  var distance_x = d3.event.clientX - kraken_head.x
  var distance_y = d3.event.clientY - kraken_head.y
  var distance = Math.sqrt(Math.pow(distance_x, 2) + Math.pow(distance_y, 2))
  var attract_multi = 3
  kraken_head.vx += ((attract_multi * distance_x) / (distance))
  kraken_head.vy += ((attract_multi * distance_y) / (distance))

  // wake arms
  arms.forEach(function (arm) {
    arm.simulation.alpha(0.1)
  })
})

svg.on('mousemove', function () {
  // attract_points[0].x = d3.event.x
  // attract_points[0].y = d3.event.y
})

var arm_maker = require('./create/arm.js')
var arms = []

// create arms
for (var i = 0; i < 4; i++) {
  arms.push(arm_maker({
    parent: svg,
    distance: 2 + i,
    count: 10,
    n_arms: 2
  }))
}

var kraken_head = {
  x: w * 0.5,
  y: h * 0.5,
  vx: Math.random() - 0.5,
  vy: Math.random() - 0.5,
  new_vx: 0,
  new_vy: 0,
  transition_triggered: false,
  bounds_margin_percent: 0.10,
  scale: 0.4
}

var g_head = svg.append('g').attr('transform', 'translate(' + kraken_head.x + ' ' + kraken_head.y + ')')

var g_kraken_head = g_head.append('g').attr('transform', 'translate(0 0)')
var g_kraken_head_scale = g_kraken_head.append('g').attr('transform', 'scale(' + [kraken_head.scale, kraken_head.scale].join(' ') + ')')

g_kraken_head_scale.append('path').attr('d', 'M172.65,132.39s-21.85-22.72-39.32-9.61c-15.94,12,0,40.2,0,40.2Z').attr('fill', 'black').attr('stroke', 'none')
var circle_eyeback_l = g_kraken_head_scale.append('path').attr('d', 'M148.44,141.72l-21.36-9.33S113.35,142,121.22,149,148.44,141.72,148.44,141.72Z').attr('fill', 'white').attr('stroke', 'none').attr('transform', 'scale(1.0 1.0)')
g_kraken_head_scale.append('path').attr('d', 'M76.14,177.35c15.11-14,50.14-27.34,68.55-38.85,14-8.74,35-13.11,35-13.11s6.12-25.34,26.21-27.09c41.5-3.61,86.58,29.35,86.58,29.35S354,119.8,398.6,143.39s99.54,145.4,21.54,222.34c-67.19,66.28-180-18.38-180-18.38s-84.37,15.11-128.94-12.42C62.88,305.1,51.55,200.1,76.14,177.35Z').attr('fill', 'black').attr('stroke', 'none')
var circle_eyeback_r = g_kraken_head_scale.append('path').attr('d', 'M188.14,158.05c-2.67-9.39,3-16.61,12-19.45,16.6-5.24,40-3.76,40-3.76s-17.68,30.76-31.66,30.76S190.8,167.44,188.14,158.05Z').attr('fill', 'white').attr('stroke', 'none').attr('transform', 'scale(1.0 1.0)')

var blink_timeout, blink_timeout2
function blink () {
  clearTimeout(blink_timeout)
  clearTimeout(blink_timeout2)
  var duration = 200
  // console.log('here')
  circle_eyeback_l.transition().attr('transform', 'translate(0 130) scale(1.0 0.1)').duration(duration)
  circle_eyeback_r.transition().attr('transform', 'translate(0 130) scale(1.0 0.1)').duration(duration)

  blink_timeout2 = setTimeout(function () {
    clearTimeout(blink_timeout)
    circle_eyeback_l.transition().duration(duration * 2).attr('transform', 'translate(0 0) scale(1.0 1.0)')
    circle_eyeback_r.transition().duration(duration * 2).attr('transform', 'translate(0 0) scale(1.0 1.0)')
    blink_timeout = setTimeout(blink, (Math.random() * 5000))
  }, duration)
}

// global tick function
function tick () {
  kraken_head.x += kraken_head.vx
  kraken_head.y += kraken_head.vy

  var scale_x = kraken_head.scale
  var scale_y = kraken_head.scale

  // turn head based on velocity
  if (kraken_head.vx < 0) {
    g_kraken_head_scale.attr('transform', 'scale(' + [scale_x, scale_y].join(' ') + ')')
    g_kraken_head.attr('transform', 'translate(-100 -120)')

  } else {
    g_kraken_head_scale.attr('transform', 'scale(' + [-scale_x, scale_y].join(' ') + ')')
    g_kraken_head.attr('transform', 'translate(100 -120)')
  }

  var r = 20

  var dirty_from_wall = false
  if (kraken_head.x > (w - (w * kraken_head.bounds_margin_percent))) {
    console.log('bounce x max')
    dirty_from_wall = true
    kraken_head.x -= (kraken_head.x - (w - (w * kraken_head.bounds_margin_percent)))
    kraken_head.vx *= -1
  }
  if (kraken_head.x < (w * kraken_head.bounds_margin_percent)) {
    console.log('bounce x min')
    dirty_from_wall = true
    kraken_head.x += (w * kraken_head.bounds_margin_percent) - kraken_head.x
    kraken_head.vx *= -1
  }
  if (kraken_head.y > h - (h * kraken_head.bounds_margin_percent)) {
    console.log('bounce y max ')
    dirty_from_wall = true
    kraken_head.y -= (kraken_head.y - (h - (h * kraken_head.bounds_margin_percent)))
    kraken_head.vy *= -1
  }
  if (kraken_head.y < (h * kraken_head.bounds_margin_percent)) {
    console.log('bounce y min')
    dirty_from_wall = true
    kraken_head.y += (h * kraken_head.bounds_margin_percent) - kraken_head.y
    kraken_head.vy *= -1
  }

  if (dirty_from_wall) {
    blink()
  }

  // move head to correct position
  g_head.attr('transform', 'translate(' + kraken_head.x + ' ' + kraken_head.y + ')')

  // dampen velocity
  var head_dampening = 0.99
  var alpha = kraken_head.vx
  kraken_head.vx *= head_dampening
  kraken_head.vy *= head_dampening

  // move head randomly when the head slows down
  if (Math.abs(alpha - kraken_head.vx) < 0.005 && kraken_head.transition_triggered === false) {
    kraken_head.transition_triggered = true

    var duration = (Math.random() * 100) + 1

    // determine how much the squid is going to move
    var v = duration / 10.0

    // set a new velocity based on random numbers
    kraken_head.new_vx = kraken_head.vx + (Math.random() * v) - (v * 0.5)
    kraken_head.new_vy = kraken_head.vy + (Math.random() * v) - (v * 0.5)

    kraken_head.vx += -kraken_head.new_vx * 0.25
    kraken_head.vy += -kraken_head.new_vy * 0.25

    // trigger transition
    setTimeout(function () {
      kraken_head.transition_triggered = false

      kraken_head.vx = kraken_head.new_vx
      kraken_head.vy = kraken_head.new_vy

      // wake arms
      arms.forEach(function (arm) {
        arm.simulation.alpha((Math.random() * 0.3) + 0.1)
        arm.simulation.restart()
      })
    }, duration * 5)
  }

  window.requestAnimationFrame(tick)
}

// setup arms tick function
arms.forEach(function (arm) {
  var simulation = arm.simulation
  var nodes = simulation.nodes()
  var links = arm.links
  var link = arm.link
  var node = arm.node
  var data = arm.data
  var count = arm.count

  simulation.on('tick', function () {
    for (var i = 0; i < nodes.length; i += arm.count) {
      nodes[i].x = kraken_head.x
      nodes[i].y = kraken_head.y
    }

    if (window.use_path === true) {
      data = []
      nodes.forEach(function (node) {
        data.push({ x: node.x, y: node.y })
      })
      arm.link.datum(data).transition()
        .attr('d', arm.line_generator)
    } else {
      arm.link.attr('x1', function (d) { return d.source.x })
        .attr('y1', function (d) { return d.source.y })
        .attr('x2', function (d) { return d.target.x })
        .attr('y2', function (d) { return d.target.y })
    }
    node.attr('transform', function (d, i) {
      return 'translate(' + d.x + ' ' + d.y + ')'
    })
  })

  simulation.on('end', function () {
    console.log('end')
    nodes.forEach(function (node, idx) {
      var v = 3.0
      node.vx += (Math.random() * v) - (v * 0.5)
      node.vy += (Math.random() * v) - (v * 0.5)
    })
    simulation.alpha((Math.random() * 0.3) + 0.1)
    simulation.restart()
  })
})

// turn everything on
tick()
blink()
fade_bg(linear_bg_stop_0)

},{"./create/arm.js":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJrcmFrZW4vY3JlYXRlL2FybS5qcyIsImtyYWtlbi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBhcm0gKG9wdGlvbnMpIHtcbiAgdmFyIG5vZGVzID0gW11cbiAgdmFyIGxpbmtzID0gW11cbiAgdmFyIG5fYXJtcyA9IG9wdGlvbnMubl9hcm1zXG4gIHZhciBjb3VudCA9IG9wdGlvbnMuY291bnRcblxuICB2YXIgbl9zZWdtZW50cyA9IG5fYXJtcyAqIGNvdW50XG5cbiAgY29uc29sZS5sb2coJ25fYXJtcycsIG5fYXJtcylcbiAgY29uc29sZS5sb2coJ3NlZ21lbnRzX3Blcl9hcm0nLCBjb3VudClcbiAgY29uc29sZS5sb2coJ3RvdGFsX3NlZ21lbnRzJywgbl9zZWdtZW50cylcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IG5fc2VnbWVudHM7IGkrKykge1xuICAgIG5vZGVzLnB1c2goe1xuICAgICAgbmFtZTogaSxcbiAgICAgIHR5cGU6ICduYScsXG4gICAgICBkb19saW5rOiAoaSA8IChuX3NlZ21lbnRzIC0gMSkpICYmXG4gICAgICAgICgoaSAlIGNvdW50KSAhPT0gKGNvdW50IC0gMSkpICYmXG4gICAgICAgIGkgPj0gMFxuICAgIH0pXG4gICAgLy8gY29uc29sZS5sb2coaSwgaSAlIGNvdW50LCAoXG4gICAgLy8gICAoaSA8IChuX3NlZ21lbnRzIC0gMSkpXG4gICAgLy8gICAmJiAoKGkgJSBjb3VudCkgIT09IChjb3VudCAtIDEpKVxuICAgIC8vICAgJiYgaSA+PSAwXG4gICAgLy8gICApKVxuICAgIGlmICgoaSA8IChuX3NlZ21lbnRzIC0gMSkpICYmXG4gICAgICAoKGkgJSBjb3VudCkgIT09IChjb3VudCAtIDEpKSAmJlxuICAgICAgaSA+PSAwXG4gICAgKSB7XG4gICAgICBsaW5rcy5wdXNoKHtcbiAgICAgICAgc291cmNlOiBpLFxuICAgICAgICB0YXJnZXQ6IGkgKyAxLFxuICAgICAgICB2YWx1ZTogaSAlIGNvdW50XG4gICAgICB9KVxuICAgIH1cbiAgfVxuICB2YXIgZDMgPSB3aW5kb3cuZDNcblxuICB2YXIgc2ltdWxhdGlvbiA9IGQzLmZvcmNlU2ltdWxhdGlvbigpXG4gICAgLnZlbG9jaXR5RGVjYXkoMC4wMSlcbiAgICAuZm9yY2UoJ2xpbmsnLCBkMy5mb3JjZUxpbmsoKS5pZChmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC5uYW1lIH0pXG4gICAgICAuZGlzdGFuY2UoZnVuY3Rpb24gKGQsIGkpIHsgcmV0dXJuIChjb3VudCAtIChpICUgY291bnQpICsgMSkgKiBvcHRpb25zLmRpc3RhbmNlIH0pXG4gIClcbiAgICAuZm9yY2UoJ21hbnknLCBkMy5mb3JjZU1hbnlCb2R5KCkuc3RyZW5ndGgoLTMpKVxuICAgIC8vIC5mb3JjZSgnY2VudGVyJywgZDMuZm9yY2VDZW50ZXIoKS54KDUwMCkueSgyNTApKVxuXG4gIHNpbXVsYXRpb24ubm9kZXMobm9kZXMpXG4gIHNpbXVsYXRpb24uZm9yY2UoJ2xpbmsnKS5saW5rcyhsaW5rcylcblxuICB3aW5kb3cucyA9IHNpbXVsYXRpb25cblxuICBub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uIChub2RlLCBpZHgpIHtcbiAgICB2YXIgYXYgPSAxMDBcbiAgICB2YXIgdiA9IDEuMFxuICAgIG5vZGUueCA9ICh3aW5kb3cuaW5uZXJXaWR0aCAqIDAuNSkgKyAoTWF0aC5yYW5kb20oKSAqIGF2KSAtIChhdiAqIDAuNSlcbiAgICBub2RlLnkgPSAod2luZG93LmlubmVySGVpZ2h0ICogMC41KSArIChNYXRoLnJhbmRvbSgpICogYXYpIC0gKGF2ICogMC41KVxuICAgIG5vZGUudnggKz0gKE1hdGgucmFuZG9tKCkgKiB2KSAtICh2ICogMC41KVxuICAgIG5vZGUudnkgKz0gKE1hdGgucmFuZG9tKCkgKiB2KSAtICh2ICogMC41KVxuICB9KVxuXG4gIHZhciBzdmcgPSBvcHRpb25zLnBhcmVudFxuXG4gIHZhciByYW5kb21fcmFuZ2VfZGlzdGFuY2UgPSAzMFxuICB2YXIgb2Zmc2V0X3ggPSAoTWF0aC5yYW5kb20oKSAqIHJhbmRvbV9yYW5nZV9kaXN0YW5jZSkgLSAocmFuZG9tX3JhbmdlX2Rpc3RhbmNlICogMC41KVxuICB2YXIgb2Zmc2V0X3kgPSAoTWF0aC5yYW5kb20oKSAqIHJhbmRvbV9yYW5nZV9kaXN0YW5jZSkgLSAocmFuZG9tX3JhbmdlX2Rpc3RhbmNlICogMC41KVxuXG4gIHN2ZyA9IHN2Zy5hcHBlbmQoJ2cnKVxuICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBvZmZzZXRfeCArICcgJyArIG9mZnNldF95ICsgJyknKVxuXG4gIHZhciBsaW5lX2dlbmVyYXRvciA9IGQzLmxpbmUoKVxuICAgIC54KGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLnggfSlcbiAgICAueShmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC55IH0pXG4gICAgLmN1cnZlKGQzLmN1cnZlQ2F0bXVsbFJvbS5hbHBoYSgxLjApKVxuXG4gIHZhciBkYXRhID0gW11cbiAgdmFyIGxpbmtcblxuICBpZiAod2luZG93LnVzZV9wYXRoID09PSB0cnVlKSB7XG4gICAgbm9kZXMuZm9yRWFjaChmdW5jdGlvbiAobm9kZSkge1xuICAgICAgZGF0YS5wdXNoKHsgeDogbm9kZS54LCB5OiBub2RlLnkgfSlcbiAgICB9KVxuICAgIGxpbmsgPSBzdmcuYXBwZW5kKCdwYXRoJylcbiAgICAgIC5kYXR1bShkYXRhKVxuICAgICAgLmF0dHIoJ2QnLCBsaW5lX2dlbmVyYXRvcilcbiAgICAgIC5hdHRyKCdjbGFzcycsICdsaW5rJylcbiAgICAgIC5hdHRyKCdzdHJva2UnLCAnYmxhY2snKVxuICAgICAgLmF0dHIoJ2ZpbGwnLCAnbm9uZScpXG4gICAgICAuYXR0cignc3Ryb2tlLWxpbmVjYXAnLCAncm91bmQnKVxuICAgICAgLnN0eWxlKCdzdHJva2Utb3BhY2l0eScsIDEuMClcbiAgICAgIC5zdHlsZSgnc3Ryb2tlLXdpZHRoJywgMylcbiAgfSBlbHNlIHtcbiAgICBsaW5rID0gc3ZnLnNlbGVjdEFsbCgnLmxpbmsnKVxuICAgICAgLmRhdGEobGlua3MpXG4gICAgICAuZW50ZXIoKS5hcHBlbmQoJ2xpbmUnKVxuICAgICAgLmF0dHIoJ2NsYXNzJywgJ2xpbmsnKVxuICAgICAgLmF0dHIoJ3N0cm9rZScsICdibGFjaycpXG4gICAgICAuYXR0cignZmlsbCcsICdub25lJylcbiAgICAgIC5hdHRyKCdzdHJva2UtbGluZWNhcCcsICdyb3VuZCcpXG4gICAgICAuc3R5bGUoJ3N0cm9rZS1vcGFjaXR5JywgMS4wKVxuICAgICAgLnN0eWxlKCdzdHJva2Utd2lkdGgnLCBmdW5jdGlvbiAoZCwgaSkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhkLnZhbHVlLCBpLCBjb3VudCAtIGQudmFsdWUpXG4gICAgICAgIHJldHVybiAoY291bnQgLSBkLnZhbHVlKSAqIDNcbiAgICAgIH0pXG4gIH1cblxuICB2YXIgbm9kZSA9IHN2Zy5zZWxlY3RBbGwoJy5ub2RlJylcbiAgICAuZGF0YShub2RlcylcbiAgICAuZW50ZXIoKS5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdub2RlJylcblxuICByZXR1cm4ge1xuICAgIHNpbXVsYXRpb246IHNpbXVsYXRpb24sXG4gICAgbGluazogbGluayxcbiAgICBsaW5rczogbGlua3MsXG4gICAgbm9kZTogbm9kZSxcbiAgICBsaW5lX2dlbmVyYXRvcjogbGluZV9nZW5lcmF0b3IsXG4gICAgZGF0YTogZGF0YSxcbiAgICBjb3VudDogY291bnQsXG4gICAgbl9hcm1zOiBuX2FybXNcbiAgfVxufVxuIiwiY29uc29sZS5sb2coJ2hlbGxvIGZyb20gdGhlIGtyYWtlbiEnKVxuXG52YXIgZDMgPSB3aW5kb3cuZDNcblxuLy8gc2NyZWVuIHNwYWNlIHZhcmlhYmxlIHNldHVwXG52YXIgdyA9IHdpbmRvdy5pbm5lcldpZHRoXG52YXIgaCA9IHdpbmRvdy5pbm5lckhlaWdodFxuXG4vLyBoYW5kbGUgcmVzaXplIGV2ZW50c1xud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcbiAgY29uc29sZS5sb2coJ3Jlc2l6ZScpXG4gIHcgPSB3aW5kb3cuaW5uZXJXaWR0aFxuICBoID0gd2luZG93LmlubmVySGVpZ2h0XG4gIHN2Zy5hdHRyKCd2aWV3Qm94JywgJzAgMCAnICsgdyArICcgJyArIGgpXG4gICAgLmF0dHIoJ3dpZHRoJywgdylcbiAgICAuYXR0cignaGVpZ2h0JywgaClcbiAgcmVjdF9iZy5hdHRyKCd3aWR0aCcsIHcpXG4gICAgLmF0dHIoJ2hlaWdodCcsIGgpXG59KVxuXG52YXIgZGl2X2tyYWtlbiA9IGQzLnNlbGVjdCgnZGl2I2tyYWtlbicpXG52YXIgc3ZnID0gZGl2X2tyYWtlbi5hcHBlbmQoJ3N2ZycpXG4gIC5hdHRyKCd2aWV3Qm94JywgJzAgMCAnICsgdyArICcgJyArIGgpXG4gIC5hdHRyKCd3aWR0aCcsIHcpXG4gIC5hdHRyKCdoZWlnaHQnLCBoKVxuICAuYXR0cigncHJlc2VydmVBc3BlY3RSYXRpbycsICd4TWlkWU1pZCcpXG5cbnZhciBkZWZzID0gc3ZnLmFwcGVuZCgnZGVmcycpXG5cbnZhciBmaWx0ZXJfZGVwdGggPSBkZWZzLmFwcGVuZCgnZmlsdGVyJylcbiAgLmF0dHIoJ2lkJywgJ2RlcHRoLWJsdXInKVxuICAuYXBwZW5kKCdmZUdhdXNzaWFuQmx1cicpLmF0dHIoJ2luJywgJ1NvdXJjZUdyYXBoaWMnKS5hdHRyKCdzdGREZXZpYXRpb24nLCAxMClcblxudmFyIGJnX3JhZGlhbF9ncmFkaWVudCA9IGRlZnMuYXBwZW5kKCdyYWRpYWxHcmFkaWVudCcpLmF0dHIoJ2lkJywgJ2dyYWRpZW50LWJnJylcblxuYmdfcmFkaWFsX2dyYWRpZW50LmFwcGVuZCgnc3RvcCcpLmF0dHIoJ29mZnNldCcsICcwJScpLmF0dHIoJ3N0b3AtY29sb3InLCAncmdiKDAsMCwxMCknKVxudmFyIGJnX3N0b3BfMSA9IGJnX3JhZGlhbF9ncmFkaWVudC5hcHBlbmQoJ3N0b3AnKS5hdHRyKCdvZmZzZXQnLCAnMTAwJScpLmF0dHIoJ3N0b3AtY29sb3InLCAncmdiKDAsMCw1MCknKVxuXG52YXIgYmdfbGluZWFyX2dyYWRpZW50ID0gZGVmcy5hcHBlbmQoJ2xpbmVhckdyYWRpZW50JylcbiAgLmF0dHIoJ2lkJywgJ2xpbmVhci1ncmFkaWVudC1iZycpXG4gIC5hdHRyKCdncmFkaWVudFRyYW5zZm9ybScsICdyb3RhdGUoOTApJylcblxudmFyIGxpbmVhcl9iZ19zdG9wXzAgPSBiZ19saW5lYXJfZ3JhZGllbnQuYXBwZW5kKCdzdG9wJykuYXR0cignb2Zmc2V0JywgJzAlJykuYXR0cignc3RvcC1jb2xvcicsICdyZ2IoMCwwLDUwKScpXG52YXIgbGluZWFyX2JnX3N0b3BfMSA9IGJnX2xpbmVhcl9ncmFkaWVudC5hcHBlbmQoJ3N0b3AnKS5hdHRyKCdvZmZzZXQnLCAnOTAlJykuYXR0cignc3RvcC1jb2xvcicsICdyZ2IoMCwwLDEwKScpXG5cbi8vIGFkZCBiYWNrZ3JvdW5kIHJlY3RhbmdsZVxudmFyIHJlY3RfYmcgPSBzdmcuYXBwZW5kKCdyZWN0JykuYXR0cigneCcsIDApLmF0dHIoJ3knLCAwKS5hdHRyKCd3aWR0aCcsIHcpLmF0dHIoJ2hlaWdodCcsIGgpLmF0dHIoJ2ZpbGwnLCAndXJsKCNsaW5lYXItZ3JhZGllbnQtYmcpJylcblxudmFyIGNpcmNsZV90YXJnZXQgPSBzdmcuYXBwZW5kKCdjaXJjbGUnKVxuICAuYXR0cignY3gnLCB3ICogMC41KVxuICAuYXR0cignY3knLCBoICogMC41KVxuICAuYXR0cigncicsIDEwMClcbiAgLmF0dHIoJ2ZpbHRlcicsICd1cmwoI2RlcHRoLWJsdXIpJylcbiAgLmF0dHIoJ2ZpbGwnLCAncmVkJylcbiAgLmF0dHIoJ29wYWNpdHknLCAwKVxuXG52YXIgZmFkZV9pbl9kdXJhdGlvbiA9IDEwMDAwXG5maWx0ZXJfZGVwdGgudHJhbnNpdGlvbigpLmF0dHIoJ3N0ZERldmlhdGlvbicsIDMpLmR1cmF0aW9uKGZhZGVfaW5fZHVyYXRpb24pXG4vLyBjaXJjbGVfdGFyZ2V0LnRyYW5zaXRpb24oKS5hdHRyKCdvcGFjaXR5JywgMSkuZHVyYXRpb24oZmFkZV9pbl9kdXJhdGlvbilcblxuZnVuY3Rpb24gZmFkZV9iZyAoYSkge1xuICB2YXIgdiA9IE1hdGgubWluKDI1NSAtIE1hdGguZmxvb3IoKGtyYWtlbl9oZWFkLnkgLyBoKSAqIDIyMCksIDE1MClcbiAgY29uc29sZS5sb2coJ2ZhZGluZyB0bycsIHYpXG4gIGEudHJhbnNpdGlvbigpXG4gICAgLmR1cmF0aW9uKDIwMDApXG4gICAgLmF0dHIoJ3N0b3AtY29sb3InLCAncmdiKDAsMCwnICsgdiArICcpJylcbiAgICAub24oJ2VuZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGZhZGVfYmcoYSlcbiAgICB9KVxufVxuXG52YXIgdGFyZ2V0X3BvaW50c1xuXG5zdmcub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAvLyBhdHRyYWN0IHRoZSBrcmFrZW4gaGVhZFxuICBkMy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gIHZhciBkaXN0YW5jZV94ID0gZDMuZXZlbnQuY2xpZW50WCAtIGtyYWtlbl9oZWFkLnhcbiAgdmFyIGRpc3RhbmNlX3kgPSBkMy5ldmVudC5jbGllbnRZIC0ga3Jha2VuX2hlYWQueVxuICB2YXIgZGlzdGFuY2UgPSBNYXRoLnNxcnQoTWF0aC5wb3coZGlzdGFuY2VfeCwgMikgKyBNYXRoLnBvdyhkaXN0YW5jZV95LCAyKSlcbiAgdmFyIGF0dHJhY3RfbXVsdGkgPSAzXG4gIGtyYWtlbl9oZWFkLnZ4ICs9ICgoYXR0cmFjdF9tdWx0aSAqIGRpc3RhbmNlX3gpIC8gKGRpc3RhbmNlKSlcbiAga3Jha2VuX2hlYWQudnkgKz0gKChhdHRyYWN0X211bHRpICogZGlzdGFuY2VfeSkgLyAoZGlzdGFuY2UpKVxuXG4gIC8vIHdha2UgYXJtc1xuICBhcm1zLmZvckVhY2goZnVuY3Rpb24gKGFybSkge1xuICAgIGFybS5zaW11bGF0aW9uLmFscGhhKDAuMSlcbiAgfSlcbn0pXG5cbnN2Zy5vbignbW91c2Vtb3ZlJywgZnVuY3Rpb24gKCkge1xuICAvLyBhdHRyYWN0X3BvaW50c1swXS54ID0gZDMuZXZlbnQueFxuICAvLyBhdHRyYWN0X3BvaW50c1swXS55ID0gZDMuZXZlbnQueVxufSlcblxudmFyIGFybV9tYWtlciA9IHJlcXVpcmUoJy4vY3JlYXRlL2FybS5qcycpXG52YXIgYXJtcyA9IFtdXG5cbi8vIGNyZWF0ZSBhcm1zXG5mb3IgKHZhciBpID0gMDsgaSA8IDQ7IGkrKykge1xuICBhcm1zLnB1c2goYXJtX21ha2VyKHtcbiAgICBwYXJlbnQ6IHN2ZyxcbiAgICBkaXN0YW5jZTogMiArIGksXG4gICAgY291bnQ6IDEwLFxuICAgIG5fYXJtczogMlxuICB9KSlcbn1cblxudmFyIGtyYWtlbl9oZWFkID0ge1xuICB4OiB3ICogMC41LFxuICB5OiBoICogMC41LFxuICB2eDogTWF0aC5yYW5kb20oKSAtIDAuNSxcbiAgdnk6IE1hdGgucmFuZG9tKCkgLSAwLjUsXG4gIG5ld192eDogMCxcbiAgbmV3X3Z5OiAwLFxuICB0cmFuc2l0aW9uX3RyaWdnZXJlZDogZmFsc2UsXG4gIGJvdW5kc19tYXJnaW5fcGVyY2VudDogMC4xMCxcbiAgc2NhbGU6IDAuNFxufVxuXG52YXIgZ19oZWFkID0gc3ZnLmFwcGVuZCgnZycpLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIGtyYWtlbl9oZWFkLnggKyAnICcgKyBrcmFrZW5faGVhZC55ICsgJyknKVxuXG52YXIgZ19rcmFrZW5faGVhZCA9IGdfaGVhZC5hcHBlbmQoJ2cnKS5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKDAgMCknKVxudmFyIGdfa3Jha2VuX2hlYWRfc2NhbGUgPSBnX2tyYWtlbl9oZWFkLmFwcGVuZCgnZycpLmF0dHIoJ3RyYW5zZm9ybScsICdzY2FsZSgnICsgW2tyYWtlbl9oZWFkLnNjYWxlLCBrcmFrZW5faGVhZC5zY2FsZV0uam9pbignICcpICsgJyknKVxuXG5nX2tyYWtlbl9oZWFkX3NjYWxlLmFwcGVuZCgncGF0aCcpLmF0dHIoJ2QnLCAnTTE3Mi42NSwxMzIuMzlzLTIxLjg1LTIyLjcyLTM5LjMyLTkuNjFjLTE1Ljk0LDEyLDAsNDAuMiwwLDQwLjJaJykuYXR0cignZmlsbCcsICdibGFjaycpLmF0dHIoJ3N0cm9rZScsICdub25lJylcbnZhciBjaXJjbGVfZXllYmFja19sID0gZ19rcmFrZW5faGVhZF9zY2FsZS5hcHBlbmQoJ3BhdGgnKS5hdHRyKCdkJywgJ00xNDguNDQsMTQxLjcybC0yMS4zNi05LjMzUzExMy4zNSwxNDIsMTIxLjIyLDE0OSwxNDguNDQsMTQxLjcyLDE0OC40NCwxNDEuNzJaJykuYXR0cignZmlsbCcsICd3aGl0ZScpLmF0dHIoJ3N0cm9rZScsICdub25lJykuYXR0cigndHJhbnNmb3JtJywgJ3NjYWxlKDEuMCAxLjApJylcbmdfa3Jha2VuX2hlYWRfc2NhbGUuYXBwZW5kKCdwYXRoJykuYXR0cignZCcsICdNNzYuMTQsMTc3LjM1YzE1LjExLTE0LDUwLjE0LTI3LjM0LDY4LjU1LTM4Ljg1LDE0LTguNzQsMzUtMTMuMTEsMzUtMTMuMTFzNi4xMi0yNS4zNCwyNi4yMS0yNy4wOWM0MS41LTMuNjEsODYuNTgsMjkuMzUsODYuNTgsMjkuMzVTMzU0LDExOS44LDM5OC42LDE0My4zOXM5OS41NCwxNDUuNCwyMS41NCwyMjIuMzRjLTY3LjE5LDY2LjI4LTE4MC0xOC4zOC0xODAtMTguMzhzLTg0LjM3LDE1LjExLTEyOC45NC0xMi40MkM2Mi44OCwzMDUuMSw1MS41NSwyMDAuMSw3Ni4xNCwxNzcuMzVaJykuYXR0cignZmlsbCcsICdibGFjaycpLmF0dHIoJ3N0cm9rZScsICdub25lJylcbnZhciBjaXJjbGVfZXllYmFja19yID0gZ19rcmFrZW5faGVhZF9zY2FsZS5hcHBlbmQoJ3BhdGgnKS5hdHRyKCdkJywgJ00xODguMTQsMTU4LjA1Yy0yLjY3LTkuMzksMy0xNi42MSwxMi0xOS40NSwxNi42LTUuMjQsNDAtMy43Niw0MC0zLjc2cy0xNy42OCwzMC43Ni0zMS42NiwzMC43NlMxOTAuOCwxNjcuNDQsMTg4LjE0LDE1OC4wNVonKS5hdHRyKCdmaWxsJywgJ3doaXRlJykuYXR0cignc3Ryb2tlJywgJ25vbmUnKS5hdHRyKCd0cmFuc2Zvcm0nLCAnc2NhbGUoMS4wIDEuMCknKVxuXG52YXIgYmxpbmtfdGltZW91dCwgYmxpbmtfdGltZW91dDJcbmZ1bmN0aW9uIGJsaW5rICgpIHtcbiAgY2xlYXJUaW1lb3V0KGJsaW5rX3RpbWVvdXQpXG4gIGNsZWFyVGltZW91dChibGlua190aW1lb3V0MilcbiAgdmFyIGR1cmF0aW9uID0gMjAwXG4gIC8vIGNvbnNvbGUubG9nKCdoZXJlJylcbiAgY2lyY2xlX2V5ZWJhY2tfbC50cmFuc2l0aW9uKCkuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgwIDEzMCkgc2NhbGUoMS4wIDAuMSknKS5kdXJhdGlvbihkdXJhdGlvbilcbiAgY2lyY2xlX2V5ZWJhY2tfci50cmFuc2l0aW9uKCkuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgwIDEzMCkgc2NhbGUoMS4wIDAuMSknKS5kdXJhdGlvbihkdXJhdGlvbilcblxuICBibGlua190aW1lb3V0MiA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgIGNsZWFyVGltZW91dChibGlua190aW1lb3V0KVxuICAgIGNpcmNsZV9leWViYWNrX2wudHJhbnNpdGlvbigpLmR1cmF0aW9uKGR1cmF0aW9uICogMikuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgwIDApIHNjYWxlKDEuMCAxLjApJylcbiAgICBjaXJjbGVfZXllYmFja19yLnRyYW5zaXRpb24oKS5kdXJhdGlvbihkdXJhdGlvbiAqIDIpLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoMCAwKSBzY2FsZSgxLjAgMS4wKScpXG4gICAgYmxpbmtfdGltZW91dCA9IHNldFRpbWVvdXQoYmxpbmssIChNYXRoLnJhbmRvbSgpICogNTAwMCkpXG4gIH0sIGR1cmF0aW9uKVxufVxuXG4vLyBnbG9iYWwgdGljayBmdW5jdGlvblxuZnVuY3Rpb24gdGljayAoKSB7XG4gIGtyYWtlbl9oZWFkLnggKz0ga3Jha2VuX2hlYWQudnhcbiAga3Jha2VuX2hlYWQueSArPSBrcmFrZW5faGVhZC52eVxuXG4gIHZhciBzY2FsZV94ID0ga3Jha2VuX2hlYWQuc2NhbGVcbiAgdmFyIHNjYWxlX3kgPSBrcmFrZW5faGVhZC5zY2FsZVxuXG4gIC8vIHR1cm4gaGVhZCBiYXNlZCBvbiB2ZWxvY2l0eVxuICBpZiAoa3Jha2VuX2hlYWQudnggPCAwKSB7XG4gICAgZ19rcmFrZW5faGVhZF9zY2FsZS5hdHRyKCd0cmFuc2Zvcm0nLCAnc2NhbGUoJyArIFtzY2FsZV94LCBzY2FsZV95XS5qb2luKCcgJykgKyAnKScpXG4gICAgZ19rcmFrZW5faGVhZC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKC0xMDAgLTEyMCknKVxuXG4gIH0gZWxzZSB7XG4gICAgZ19rcmFrZW5faGVhZF9zY2FsZS5hdHRyKCd0cmFuc2Zvcm0nLCAnc2NhbGUoJyArIFstc2NhbGVfeCwgc2NhbGVfeV0uam9pbignICcpICsgJyknKVxuICAgIGdfa3Jha2VuX2hlYWQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgxMDAgLTEyMCknKVxuICB9XG5cbiAgdmFyIHIgPSAyMFxuXG4gIHZhciBkaXJ0eV9mcm9tX3dhbGwgPSBmYWxzZVxuICBpZiAoa3Jha2VuX2hlYWQueCA+ICh3IC0gKHcgKiBrcmFrZW5faGVhZC5ib3VuZHNfbWFyZ2luX3BlcmNlbnQpKSkge1xuICAgIGNvbnNvbGUubG9nKCdib3VuY2UgeCBtYXgnKVxuICAgIGRpcnR5X2Zyb21fd2FsbCA9IHRydWVcbiAgICBrcmFrZW5faGVhZC54IC09IChrcmFrZW5faGVhZC54IC0gKHcgLSAodyAqIGtyYWtlbl9oZWFkLmJvdW5kc19tYXJnaW5fcGVyY2VudCkpKVxuICAgIGtyYWtlbl9oZWFkLnZ4ICo9IC0xXG4gIH1cbiAgaWYgKGtyYWtlbl9oZWFkLnggPCAodyAqIGtyYWtlbl9oZWFkLmJvdW5kc19tYXJnaW5fcGVyY2VudCkpIHtcbiAgICBjb25zb2xlLmxvZygnYm91bmNlIHggbWluJylcbiAgICBkaXJ0eV9mcm9tX3dhbGwgPSB0cnVlXG4gICAga3Jha2VuX2hlYWQueCArPSAodyAqIGtyYWtlbl9oZWFkLmJvdW5kc19tYXJnaW5fcGVyY2VudCkgLSBrcmFrZW5faGVhZC54XG4gICAga3Jha2VuX2hlYWQudnggKj0gLTFcbiAgfVxuICBpZiAoa3Jha2VuX2hlYWQueSA+IGggLSAoaCAqIGtyYWtlbl9oZWFkLmJvdW5kc19tYXJnaW5fcGVyY2VudCkpIHtcbiAgICBjb25zb2xlLmxvZygnYm91bmNlIHkgbWF4ICcpXG4gICAgZGlydHlfZnJvbV93YWxsID0gdHJ1ZVxuICAgIGtyYWtlbl9oZWFkLnkgLT0gKGtyYWtlbl9oZWFkLnkgLSAoaCAtIChoICoga3Jha2VuX2hlYWQuYm91bmRzX21hcmdpbl9wZXJjZW50KSkpXG4gICAga3Jha2VuX2hlYWQudnkgKj0gLTFcbiAgfVxuICBpZiAoa3Jha2VuX2hlYWQueSA8IChoICoga3Jha2VuX2hlYWQuYm91bmRzX21hcmdpbl9wZXJjZW50KSkge1xuICAgIGNvbnNvbGUubG9nKCdib3VuY2UgeSBtaW4nKVxuICAgIGRpcnR5X2Zyb21fd2FsbCA9IHRydWVcbiAgICBrcmFrZW5faGVhZC55ICs9IChoICoga3Jha2VuX2hlYWQuYm91bmRzX21hcmdpbl9wZXJjZW50KSAtIGtyYWtlbl9oZWFkLnlcbiAgICBrcmFrZW5faGVhZC52eSAqPSAtMVxuICB9XG5cbiAgaWYgKGRpcnR5X2Zyb21fd2FsbCkge1xuICAgIGJsaW5rKClcbiAgfVxuXG4gIC8vIG1vdmUgaGVhZCB0byBjb3JyZWN0IHBvc2l0aW9uXG4gIGdfaGVhZC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBrcmFrZW5faGVhZC54ICsgJyAnICsga3Jha2VuX2hlYWQueSArICcpJylcblxuICAvLyBkYW1wZW4gdmVsb2NpdHlcbiAgdmFyIGhlYWRfZGFtcGVuaW5nID0gMC45OVxuICB2YXIgYWxwaGEgPSBrcmFrZW5faGVhZC52eFxuICBrcmFrZW5faGVhZC52eCAqPSBoZWFkX2RhbXBlbmluZ1xuICBrcmFrZW5faGVhZC52eSAqPSBoZWFkX2RhbXBlbmluZ1xuXG4gIC8vIG1vdmUgaGVhZCByYW5kb21seSB3aGVuIHRoZSBoZWFkIHNsb3dzIGRvd25cbiAgaWYgKE1hdGguYWJzKGFscGhhIC0ga3Jha2VuX2hlYWQudngpIDwgMC4wMDUgJiYga3Jha2VuX2hlYWQudHJhbnNpdGlvbl90cmlnZ2VyZWQgPT09IGZhbHNlKSB7XG4gICAga3Jha2VuX2hlYWQudHJhbnNpdGlvbl90cmlnZ2VyZWQgPSB0cnVlXG5cbiAgICB2YXIgZHVyYXRpb24gPSAoTWF0aC5yYW5kb20oKSAqIDEwMCkgKyAxXG5cbiAgICAvLyBkZXRlcm1pbmUgaG93IG11Y2ggdGhlIHNxdWlkIGlzIGdvaW5nIHRvIG1vdmVcbiAgICB2YXIgdiA9IGR1cmF0aW9uIC8gMTAuMFxuXG4gICAgLy8gc2V0IGEgbmV3IHZlbG9jaXR5IGJhc2VkIG9uIHJhbmRvbSBudW1iZXJzXG4gICAga3Jha2VuX2hlYWQubmV3X3Z4ID0ga3Jha2VuX2hlYWQudnggKyAoTWF0aC5yYW5kb20oKSAqIHYpIC0gKHYgKiAwLjUpXG4gICAga3Jha2VuX2hlYWQubmV3X3Z5ID0ga3Jha2VuX2hlYWQudnkgKyAoTWF0aC5yYW5kb20oKSAqIHYpIC0gKHYgKiAwLjUpXG5cbiAgICBrcmFrZW5faGVhZC52eCArPSAta3Jha2VuX2hlYWQubmV3X3Z4ICogMC4yNVxuICAgIGtyYWtlbl9oZWFkLnZ5ICs9IC1rcmFrZW5faGVhZC5uZXdfdnkgKiAwLjI1XG5cbiAgICAvLyB0cmlnZ2VyIHRyYW5zaXRpb25cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGtyYWtlbl9oZWFkLnRyYW5zaXRpb25fdHJpZ2dlcmVkID0gZmFsc2VcblxuICAgICAga3Jha2VuX2hlYWQudnggPSBrcmFrZW5faGVhZC5uZXdfdnhcbiAgICAgIGtyYWtlbl9oZWFkLnZ5ID0ga3Jha2VuX2hlYWQubmV3X3Z5XG5cbiAgICAgIC8vIHdha2UgYXJtc1xuICAgICAgYXJtcy5mb3JFYWNoKGZ1bmN0aW9uIChhcm0pIHtcbiAgICAgICAgYXJtLnNpbXVsYXRpb24uYWxwaGEoKE1hdGgucmFuZG9tKCkgKiAwLjMpICsgMC4xKVxuICAgICAgICBhcm0uc2ltdWxhdGlvbi5yZXN0YXJ0KClcbiAgICAgIH0pXG4gICAgfSwgZHVyYXRpb24gKiA1KVxuICB9XG5cbiAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aWNrKVxufVxuXG4vLyBzZXR1cCBhcm1zIHRpY2sgZnVuY3Rpb25cbmFybXMuZm9yRWFjaChmdW5jdGlvbiAoYXJtKSB7XG4gIHZhciBzaW11bGF0aW9uID0gYXJtLnNpbXVsYXRpb25cbiAgdmFyIG5vZGVzID0gc2ltdWxhdGlvbi5ub2RlcygpXG4gIHZhciBsaW5rcyA9IGFybS5saW5rc1xuICB2YXIgbGluayA9IGFybS5saW5rXG4gIHZhciBub2RlID0gYXJtLm5vZGVcbiAgdmFyIGRhdGEgPSBhcm0uZGF0YVxuICB2YXIgY291bnQgPSBhcm0uY291bnRcblxuICBzaW11bGF0aW9uLm9uKCd0aWNrJywgZnVuY3Rpb24gKCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpICs9IGFybS5jb3VudCkge1xuICAgICAgbm9kZXNbaV0ueCA9IGtyYWtlbl9oZWFkLnhcbiAgICAgIG5vZGVzW2ldLnkgPSBrcmFrZW5faGVhZC55XG4gICAgfVxuXG4gICAgaWYgKHdpbmRvdy51c2VfcGF0aCA9PT0gdHJ1ZSkge1xuICAgICAgZGF0YSA9IFtdXG4gICAgICBub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgIGRhdGEucHVzaCh7IHg6IG5vZGUueCwgeTogbm9kZS55IH0pXG4gICAgICB9KVxuICAgICAgYXJtLmxpbmsuZGF0dW0oZGF0YSkudHJhbnNpdGlvbigpXG4gICAgICAgIC5hdHRyKCdkJywgYXJtLmxpbmVfZ2VuZXJhdG9yKVxuICAgIH0gZWxzZSB7XG4gICAgICBhcm0ubGluay5hdHRyKCd4MScsIGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLnNvdXJjZS54IH0pXG4gICAgICAgIC5hdHRyKCd5MScsIGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLnNvdXJjZS55IH0pXG4gICAgICAgIC5hdHRyKCd4MicsIGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLnRhcmdldC54IH0pXG4gICAgICAgIC5hdHRyKCd5MicsIGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLnRhcmdldC55IH0pXG4gICAgfVxuICAgIG5vZGUuYXR0cigndHJhbnNmb3JtJywgZnVuY3Rpb24gKGQsIGkpIHtcbiAgICAgIHJldHVybiAndHJhbnNsYXRlKCcgKyBkLnggKyAnICcgKyBkLnkgKyAnKSdcbiAgICB9KVxuICB9KVxuXG4gIHNpbXVsYXRpb24ub24oJ2VuZCcsIGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLmxvZygnZW5kJylcbiAgICBub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uIChub2RlLCBpZHgpIHtcbiAgICAgIHZhciB2ID0gMy4wXG4gICAgICBub2RlLnZ4ICs9IChNYXRoLnJhbmRvbSgpICogdikgLSAodiAqIDAuNSlcbiAgICAgIG5vZGUudnkgKz0gKE1hdGgucmFuZG9tKCkgKiB2KSAtICh2ICogMC41KVxuICAgIH0pXG4gICAgc2ltdWxhdGlvbi5hbHBoYSgoTWF0aC5yYW5kb20oKSAqIDAuMykgKyAwLjEpXG4gICAgc2ltdWxhdGlvbi5yZXN0YXJ0KClcbiAgfSlcbn0pXG5cbi8vIHR1cm4gZXZlcnl0aGluZyBvblxudGljaygpXG5ibGluaygpXG5mYWRlX2JnKGxpbmVhcl9iZ19zdG9wXzApXG4iXX0=
