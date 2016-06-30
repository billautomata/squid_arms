(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function arm (options) {
  var nodes = []
  var links = []
  var count = options.count
  for (var i = 0; i < count; i++) {
    nodes.push({
      name: i,
      type: 'na'
    })
    if (i < count - 1) {
      links.push({
        source: i,
        target: i + 1,
        value: i
      })
    }
  }
  var d3 = window.d3

  // var mouse_force_x = d3.forceX().x(0).strength(0)
  // var mouse_force_y = d3.forceY().y(0).strength(0)

  var simulation = d3.forceSimulation()
    // .alphaMin(0)
    .velocityDecay(0.01)
    .force('link', d3.forceLink().id(function (d) { return d.name })
      // .strength(1)
      .distance(function (d, i) { return (links.length - i + 1) * options.distance })
  )
    .force('many', d3.forceManyBody().strength(-2))
    // .force('center', d3.forceCenter().x(500).y(250))

  simulation.nodes(nodes)
  simulation.force('link').links(links)

  window.s = simulation

  nodes.forEach(function (node, idx) {
    // console.log(link)
    var v = 15.0
    node.x = 500
    node.y = 250
    node.vx += (Math.random() * v) - (v * 0.5)
    node.vy += (Math.random() * v) - (v * 0.5)
  })
  var svg = options.parent

  var random_range_distance = 30
  var offset_x = (Math.random() * random_range_distance) - (random_range_distance * 0.5)
  var offset_y = (Math.random() * random_range_distance) - (random_range_distance * 0.5)
  svg = svg.append('g')
    .attr('transform', 'translate(' + offset_x + ' ' + offset_y + ')')

  svg.append('rect').attr('x', 0).attr('y', 0).attr('width', 1000).attr('height', 500).style('opacity', 0)

  var line_generator = d3.line()
    .x(function (d) { return d.x })
    .y(function (d) { return d.y })
    // .curve(d3.curveNatural)
    .curve(d3.curveCatmullRom.alpha(0.1))

  var data = []

  if (window.use_path === true) {
    nodes.forEach(function (node) {
      data.push({ x: node.x, y: node.y })
    })
    console.log(data.length, links.length)
    var link = svg.append('path')
      .datum(data)
      .attr('d', line_generator)
      .attr('class', 'link')
      .attr('stroke', 'black')
      .attr('fill', 'none')
      .attr('stroke-linecap', 'round')
      .style('stroke-opacity', 1.0)
      .style('stroke-width', 3)
  } else {
    var link = svg.selectAll('.link')
      .data(links)
      .enter().append('line')
      .attr('class', 'link')
      .attr('stroke', 'black')
      .attr('fill', 'none')
      .attr('stroke-linecap', 'round')
      .style('stroke-opacity', 1.0)
      .style('stroke-width', function (d, i) {
        return (links.length - i) * 3
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
    data: data
  }
}

},{}],2:[function(require,module,exports){
console.log('hello from the kraken!')

console.log('lol')

var w = 1000
var h = 500

var circle_head_segment_0_radius = 40
var circle_head_segment_1_radius = 30

var d3 = window.d3

var div_kraken = d3.select('div#kraken')
var svg = div_kraken.append('svg')
  .attr('viewBox', '0 0 ' + w + ' ' + h)
  .attr('width', '100%')
  .attr('preserveAspectRatio', 'xMidYMid')
  .style('background-color', 'rgba(0,0,0,0.3)')

var arm_maker = require('./create/arm.js')
var arms = []

for (var i = 0; i < 8; i++) {
  arms.push(arm_maker({
    parent: svg,
    distance: 10,
    count: 8
  }))
}

var head_ligaments = arm_maker({
  parent: svg,
  distance: 1,
  count: 1
})

// head_ligaments.simulation.velocityDecay(0.01)
// head_ligaments.simulation.force('link').strength(1)

console.log(head_ligaments)

var head_position = {
  x: w * 0.5,
  y: h * 0.5,
  vx: Math.random() - 0.5,
  vy: Math.random() - 0.5,
  new_vx: 0,
  new_vy: 0,
  r: 50,
  transition_triggered: false
}

// var circle_head_segment_0 = svg.append('ellipse').attr('cx', 0).attr('cy', 0).attr('rx', circle_head_segment_0_radius).attr('ry', circle_head_segment_0_radius).attr('fill', 'black')
// var circle_head_segment_1 = svg.append('ellipse').attr('cx', 0).attr('cy', 0).attr('rx', circle_head_segment_1_radius).attr('ry', circle_head_segment_1_radius).attr('fill', 'black')

var g_head = svg.append('g').attr('transform', 'translate(' + head_position.x + ' ' + head_position.y + ')')

var scale_kraken_head = 0.4
var g_kraken_head = g_head.append('g').attr('transform', 'translate(0 0)')
var g_kraken_head_scale = g_kraken_head.append('g').attr('transform', 'scale(' + [scale_kraken_head, scale_kraken_head].join(' ') + ')')

g_kraken_head_scale.append('path').attr('d', 'M172.65,132.39s-21.85-22.72-39.32-9.61c-15.94,12,0,40.2,0,40.2Z').attr('fill', 'black').attr('stroke', 'none')
g_kraken_head_scale.append('path').attr('d', 'M148.44,141.72l-21.36-9.33S113.35,142,121.22,149,148.44,141.72,148.44,141.72Z').attr('fill', 'white').attr('stroke', 'none')
g_kraken_head_scale.append('path').attr('d', 'M76.14,177.35c15.11-14,50.14-27.34,68.55-38.85,14-8.74,35-13.11,35-13.11s6.12-25.34,26.21-27.09c41.5-3.61,86.58,29.35,86.58,29.35S354,119.8,398.6,143.39s99.54,145.4,21.54,222.34c-67.19,66.28-180-18.38-180-18.38s-84.37,15.11-128.94-12.42C62.88,305.1,51.55,200.1,76.14,177.35Z').attr('fill', 'black').attr('stroke', 'none')
g_kraken_head_scale.append('path').attr('d', 'M188.14,158.05c-2.67-9.39,3-16.61,12-19.45,16.6-5.24,40-3.76,40-3.76s-17.68,30.76-31.66,30.76S190.8,167.44,188.14,158.05Z').attr('fill', 'white').attr('stroke', 'none')

// <path class="cls-1" d="M172.65,132.39s-21.85-22.72-39.32-9.61c-15.94,12,0,40.2,0,40.2Z" transform="translate(-63.56 -98.04)"/>
// <path class="cls-2" d="M148.44,141.72l-21.36-9.33S113.35,142,121.22,149,148.44,141.72,148.44,141.72Z" transform="translate(-63.56 -98.04)"/>
// <path class="cls-1" d="M76.14,177.35c15.11-14,50.14-27.34,68.55-38.85,14-8.74,35-13.11,35-13.11s6.12-25.34,26.21-27.09c41.5-3.61,86.58,29.35,86.58,29.35S354,119.8,398.6,143.39s99.54,145.4,21.54,222.34c-67.19,66.28-180-18.38-180-18.38s-84.37,15.11-128.94-12.42C62.88,305.1,51.55,200.1,76.14,177.35Z" transform="translate(-63.56 -98.04)"/>
// <path class="cls-2" d="M188.14,158.05c-2.67-9.39,3-16.61,12-19.45,16.6-5.24,40-3.76,40-3.76s-17.68,30.76-31.66,30.76S190.8,167.44,188.14,158.05Z" transform="translate(-63.56 -98.04)"/>

var circle_head = g_head.append('circle')
  .attr('cx', 0)
  .attr('fill', 'none')
  .attr('cy', 0).attr('r', head_position.r)
  .attr('stroke', 'none')

var g_eye_l = g_head.append('g').attr('transform', 'translate(-15 -10)').attr('opacity', 0)
var g_eye_r = g_head.append('g').attr('transform', 'translate(15 -10)').attr('opacity', 0)
var circle_eyeback_l = g_eye_l.append('circle').attr('cx', 0).attr('cy', 0).attr('r', 10).attr('fill', 'white').attr('transform', 'scale(1.0 0.7)')
var circle_eyeback_r = g_eye_r.append('circle').attr('cx', 0).attr('cy', 0).attr('r', 10).attr('fill', 'white').attr('transform', 'scale(1.0 0.7)')
var circle_eyeball_l = g_eye_l.append('circle').attr('cx', 0).attr('cy', 0).attr('r', 2).attr('fill', 'rgba(0,0,0,0.9)') // .attr('stroke', 'green').attr('stroke-width', 1.5)
var circle_eyeball_r = g_eye_r.append('circle').attr('cx', 0).attr('cy', 0).attr('r', 2).attr('fill', 'rgba(0,0,0,0.9)') // .attr('stroke', 'green').attr('stroke-width', 1.5)

var blink_timeout, blink_timeout2
function blink () {
  clearTimeout(blink_timeout)
  clearTimeout(blink_timeout2)
  var duration = 20
  circle_eyeback_l.transition().attr('transform', 'scale(1.0 0.1)').ease(d3.easeLinear).duration(duration)
  circle_eyeback_r.transition().attr('transform', 'scale(1.0 0.1)').ease(d3.easeLinear).duration(duration)
  blink_timeout2 = setTimeout(function () {
    clearTimeout(blink_timeout)
    circle_eyeback_l.transition().attr('transform', 'scale(1.0 0.7)').ease(d3.easeLinear)
    circle_eyeback_r.transition().attr('transform', 'scale(1.0 0.7)').ease(d3.easeLinear)
    blink_timeout = setTimeout(blink, (Math.random() * 5000))
  }, duration)
}
blink()

var tick = function () {
  head_position.x += head_position.vx
  head_position.y += head_position.vy

  var scale_x = scale_kraken_head
  var scale_y = scale_kraken_head
  if (head_position.vx < 0) {
    g_kraken_head_scale.attr('transform', 'scale(' + [scale_x, scale_y].join(' ') + ')')
    g_kraken_head.attr('transform', 'translate(-100 -120)')
  } else {
    g_kraken_head_scale.attr('transform', 'scale(' + [-scale_x, scale_y].join(' ') + ')')
    g_kraken_head.attr('transform', 'translate(100 -120)')
  }

  head_ligaments.simulation.nodes()[0].x = head_position.x
  head_ligaments.simulation.nodes()[0].y = head_position.y

  var r = 20

  var dirty_from_wall = false
  if (head_position.x > w) {
    dirty_from_wall = true
    head_position.x -= (head_position.x - w)
    head_position.vx *= -1
  }
  if (head_position.x < 0) {
    dirty_from_wall = true
    head_position.x += (-head_position.x)
    head_position.vx *= -1
  }
  if (head_position.y > h) {
    dirty_from_wall = true
    head_position.y -= (head_position.y - h)
    head_position.vy *= -1
  }
  if (head_position.y < 0) {
    dirty_from_wall = true
    head_position.y += (-head_position.y)
    head_position.vy *= -1
  }

  if (dirty_from_wall) {
    circle_eyeball_l.transition().attr('cx', head_position.vx).attr('cy', head_position.vy)
    circle_eyeball_r.transition().attr('cx', head_position.vx).attr('cy', head_position.vy)
    blink()
  }

  g_head.attr('transform', 'translate(' + head_position.x + ' ' + head_position.y + ')')

  var head_dampening = 0.99
  var alpha = head_position.vx
  head_position.vx *= head_dampening
  head_position.vy *= head_dampening

  // move head randomly
  if (Math.abs(alpha - head_position.vx) < 0.005 && head_position.transition_triggered === false) {
    head_position.transition_triggered = true
    var duration = (Math.random() * 100) + 1

    // determine how much the squid is going to move
    var v = duration / 20.0

    // circle_head_segment_0.transition().duration(2000).attr('rx', Math.random() * 10 + circle_head_segment_0_radius).attr('ry', Math.random() * 10 + circle_head_segment_0_radius).ease(d3.easeBounce)
    // circle_head_segment_1.transition().duration(2000).attr('rx', Math.random() * 20 + circle_head_segment_1_radius).attr('ry', Math.random() * 20 + circle_head_segment_1_radius).ease(d3.easeBounce)
    // head_ligaments.simulation.force('link').strength(2)

    // set a new velocity based on random numbers
    head_position.new_vx = head_position.vx + (Math.random() * v) - (v * 0.5)
    head_position.new_vy = head_position.vy + (Math.random() * v) - (v * 0.5)

    head_position.vx += -head_position.new_vx * 0.25
    head_position.vy += -head_position.new_vy * 0.25

    circle_head.transition()
      .attr('r', head_position.r - (duration / 5))
      .ease(d3.easeLinear)
      .duration(duration * 2)

    circle_eyeback_l.transition().attr('transform', 'scale(1.0, 0.9)')
    circle_eyeback_r.transition().attr('transform', 'scale(1.0, 0.9)')
    circle_eyeball_l.transition().attr('cx', head_position.new_vx).attr('cy', head_position.new_vy).attr('r', 3).attr('fill', 'red').ease(d3.easeBounce)
    circle_eyeball_r.transition().attr('cx', head_position.new_vx).attr('cy', head_position.new_vy).attr('r', 3).attr('fill', 'red').ease(d3.easeBounce)

    setTimeout(function () {
      head_position.transition_triggered = false
      circle_head.transition().attr('r', head_position.r)
        .ease(d3.easeElastic).duration(1000)
        .delay(duration / 2)

      circle_eyeback_l.transition().attr('transform', 'scale(1.0, 0.7)')
      circle_eyeback_r.transition().attr('transform', 'scale(1.0, 0.7)')
      circle_eyeball_l.transition().attr('fill', 'rgba(0,0,0,0.9)').attr('r', 2).duration(1000).ease(d3.easeElastic)
      circle_eyeball_r.transition().attr('fill', 'rgba(0,0,0,0.9)').attr('r', 2).duration(1000).ease(d3.easeElastic)

      head_position.vx = head_position.new_vx
      head_position.vy = head_position.new_vy

      //
      arms.forEach(function (arm) {
        arm.simulation.alpha((Math.random() * 0.3) + 0.1)
        arm.simulation.restart()
      })
    }, duration * 5)
  }

  // attract nodes
  // arms.forEach(function (arm, idx) {
  //   var nodes = arm.simulation.nodes()
  //   var target_x = w / (idx + 1)
  //   var target_y = 10
  //   var arm_tip = nodes[nodes.length - 1]
  //
  //   var distance_x = target_x - arm_tip.x
  //   var distance_y = target_y - arm_tip.y
  //
  //   arm_tip.x += distance_x / 10
  //   arm_tip.y += distance_y / 10
  // })

  window.requestAnimationFrame(tick)
}
tick()

head_ligaments.simulation.on('tick', function () {
  var simulation = head_ligaments.simulation
  var nodes = simulation.nodes()
  var links = head_ligaments.links
  var link = head_ligaments.link
  var node = head_ligaments.node
  var data = head_ligaments.data
  nodes[0].x = head_position.x
  nodes[0].y = head_position.y

  // circle_head_segment_0.attr('cx', nodes[1].x)
  // circle_head_segment_0.attr('cy', nodes[1].y)
  // circle_head_segment_1.attr('cx', nodes[0].x)
  // circle_head_segment_1.attr('cy', nodes[0].y)

  head_ligaments.link.attr('x1', function (d) { return d.source.x })
    .attr('y1', function (d) { return d.source.y })
    .attr('x2', function (d) { return d.target.x })
    .attr('y2', function (d) { return d.target.y })
})
head_ligaments.simulation.on('end', function () {
  head_ligaments.simulation.alpha(0.1)
  head_ligaments.simulation.restart()
})

arms.forEach(function (arm) {
  var simulation = arm.simulation
  var nodes = simulation.nodes()
  var links = arm.links
  var link = arm.link
  var node = arm.node
  var data = arm.data

  simulation.on('tick', function () {
    nodes[0].x = head_position.x
    nodes[0].y = head_position.y

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
      var v = 1.0
      node.vx += (Math.random() * v) - (v * 0.5)
      node.vy += (Math.random() * v) - (v * 0.5)
    })
    simulation.alpha((Math.random() * 0.3) + 0.1)
    simulation.restart()
  })
})

},{"./create/arm.js":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJrcmFrZW4vY3JlYXRlL2FybS5qcyIsImtyYWtlbi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYXJtIChvcHRpb25zKSB7XG4gIHZhciBub2RlcyA9IFtdXG4gIHZhciBsaW5rcyA9IFtdXG4gIHZhciBjb3VudCA9IG9wdGlvbnMuY291bnRcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgbm9kZXMucHVzaCh7XG4gICAgICBuYW1lOiBpLFxuICAgICAgdHlwZTogJ25hJ1xuICAgIH0pXG4gICAgaWYgKGkgPCBjb3VudCAtIDEpIHtcbiAgICAgIGxpbmtzLnB1c2goe1xuICAgICAgICBzb3VyY2U6IGksXG4gICAgICAgIHRhcmdldDogaSArIDEsXG4gICAgICAgIHZhbHVlOiBpXG4gICAgICB9KVxuICAgIH1cbiAgfVxuICB2YXIgZDMgPSB3aW5kb3cuZDNcblxuICAvLyB2YXIgbW91c2VfZm9yY2VfeCA9IGQzLmZvcmNlWCgpLngoMCkuc3RyZW5ndGgoMClcbiAgLy8gdmFyIG1vdXNlX2ZvcmNlX3kgPSBkMy5mb3JjZVkoKS55KDApLnN0cmVuZ3RoKDApXG5cbiAgdmFyIHNpbXVsYXRpb24gPSBkMy5mb3JjZVNpbXVsYXRpb24oKVxuICAgIC8vIC5hbHBoYU1pbigwKVxuICAgIC52ZWxvY2l0eURlY2F5KDAuMDEpXG4gICAgLmZvcmNlKCdsaW5rJywgZDMuZm9yY2VMaW5rKCkuaWQoZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQubmFtZSB9KVxuICAgICAgLy8gLnN0cmVuZ3RoKDEpXG4gICAgICAuZGlzdGFuY2UoZnVuY3Rpb24gKGQsIGkpIHsgcmV0dXJuIChsaW5rcy5sZW5ndGggLSBpICsgMSkgKiBvcHRpb25zLmRpc3RhbmNlIH0pXG4gIClcbiAgICAuZm9yY2UoJ21hbnknLCBkMy5mb3JjZU1hbnlCb2R5KCkuc3RyZW5ndGgoLTIpKVxuICAgIC8vIC5mb3JjZSgnY2VudGVyJywgZDMuZm9yY2VDZW50ZXIoKS54KDUwMCkueSgyNTApKVxuXG4gIHNpbXVsYXRpb24ubm9kZXMobm9kZXMpXG4gIHNpbXVsYXRpb24uZm9yY2UoJ2xpbmsnKS5saW5rcyhsaW5rcylcblxuICB3aW5kb3cucyA9IHNpbXVsYXRpb25cblxuICBub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uIChub2RlLCBpZHgpIHtcbiAgICAvLyBjb25zb2xlLmxvZyhsaW5rKVxuICAgIHZhciB2ID0gMTUuMFxuICAgIG5vZGUueCA9IDUwMFxuICAgIG5vZGUueSA9IDI1MFxuICAgIG5vZGUudnggKz0gKE1hdGgucmFuZG9tKCkgKiB2KSAtICh2ICogMC41KVxuICAgIG5vZGUudnkgKz0gKE1hdGgucmFuZG9tKCkgKiB2KSAtICh2ICogMC41KVxuICB9KVxuICB2YXIgc3ZnID0gb3B0aW9ucy5wYXJlbnRcblxuICB2YXIgcmFuZG9tX3JhbmdlX2Rpc3RhbmNlID0gMzBcbiAgdmFyIG9mZnNldF94ID0gKE1hdGgucmFuZG9tKCkgKiByYW5kb21fcmFuZ2VfZGlzdGFuY2UpIC0gKHJhbmRvbV9yYW5nZV9kaXN0YW5jZSAqIDAuNSlcbiAgdmFyIG9mZnNldF95ID0gKE1hdGgucmFuZG9tKCkgKiByYW5kb21fcmFuZ2VfZGlzdGFuY2UpIC0gKHJhbmRvbV9yYW5nZV9kaXN0YW5jZSAqIDAuNSlcbiAgc3ZnID0gc3ZnLmFwcGVuZCgnZycpXG4gICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIG9mZnNldF94ICsgJyAnICsgb2Zmc2V0X3kgKyAnKScpXG5cbiAgc3ZnLmFwcGVuZCgncmVjdCcpLmF0dHIoJ3gnLCAwKS5hdHRyKCd5JywgMCkuYXR0cignd2lkdGgnLCAxMDAwKS5hdHRyKCdoZWlnaHQnLCA1MDApLnN0eWxlKCdvcGFjaXR5JywgMClcblxuICB2YXIgbGluZV9nZW5lcmF0b3IgPSBkMy5saW5lKClcbiAgICAueChmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC54IH0pXG4gICAgLnkoZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQueSB9KVxuICAgIC8vIC5jdXJ2ZShkMy5jdXJ2ZU5hdHVyYWwpXG4gICAgLmN1cnZlKGQzLmN1cnZlQ2F0bXVsbFJvbS5hbHBoYSgwLjEpKVxuXG4gIHZhciBkYXRhID0gW11cblxuICBpZiAod2luZG93LnVzZV9wYXRoID09PSB0cnVlKSB7XG4gICAgbm9kZXMuZm9yRWFjaChmdW5jdGlvbiAobm9kZSkge1xuICAgICAgZGF0YS5wdXNoKHsgeDogbm9kZS54LCB5OiBub2RlLnkgfSlcbiAgICB9KVxuICAgIGNvbnNvbGUubG9nKGRhdGEubGVuZ3RoLCBsaW5rcy5sZW5ndGgpXG4gICAgdmFyIGxpbmsgPSBzdmcuYXBwZW5kKCdwYXRoJylcbiAgICAgIC5kYXR1bShkYXRhKVxuICAgICAgLmF0dHIoJ2QnLCBsaW5lX2dlbmVyYXRvcilcbiAgICAgIC5hdHRyKCdjbGFzcycsICdsaW5rJylcbiAgICAgIC5hdHRyKCdzdHJva2UnLCAnYmxhY2snKVxuICAgICAgLmF0dHIoJ2ZpbGwnLCAnbm9uZScpXG4gICAgICAuYXR0cignc3Ryb2tlLWxpbmVjYXAnLCAncm91bmQnKVxuICAgICAgLnN0eWxlKCdzdHJva2Utb3BhY2l0eScsIDEuMClcbiAgICAgIC5zdHlsZSgnc3Ryb2tlLXdpZHRoJywgMylcbiAgfSBlbHNlIHtcbiAgICB2YXIgbGluayA9IHN2Zy5zZWxlY3RBbGwoJy5saW5rJylcbiAgICAgIC5kYXRhKGxpbmtzKVxuICAgICAgLmVudGVyKCkuYXBwZW5kKCdsaW5lJylcbiAgICAgIC5hdHRyKCdjbGFzcycsICdsaW5rJylcbiAgICAgIC5hdHRyKCdzdHJva2UnLCAnYmxhY2snKVxuICAgICAgLmF0dHIoJ2ZpbGwnLCAnbm9uZScpXG4gICAgICAuYXR0cignc3Ryb2tlLWxpbmVjYXAnLCAncm91bmQnKVxuICAgICAgLnN0eWxlKCdzdHJva2Utb3BhY2l0eScsIDEuMClcbiAgICAgIC5zdHlsZSgnc3Ryb2tlLXdpZHRoJywgZnVuY3Rpb24gKGQsIGkpIHtcbiAgICAgICAgcmV0dXJuIChsaW5rcy5sZW5ndGggLSBpKSAqIDNcbiAgICAgIH0pXG4gIH1cblxuICB2YXIgbm9kZSA9IHN2Zy5zZWxlY3RBbGwoJy5ub2RlJylcbiAgICAuZGF0YShub2RlcylcbiAgICAuZW50ZXIoKS5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdub2RlJylcblxuICByZXR1cm4ge1xuICAgIHNpbXVsYXRpb246IHNpbXVsYXRpb24sXG4gICAgbGluazogbGluayxcbiAgICBsaW5rczogbGlua3MsXG4gICAgbm9kZTogbm9kZSxcbiAgICBsaW5lX2dlbmVyYXRvcjogbGluZV9nZW5lcmF0b3IsXG4gICAgZGF0YTogZGF0YVxuICB9XG59XG4iLCJjb25zb2xlLmxvZygnaGVsbG8gZnJvbSB0aGUga3Jha2VuIScpXG5cbmNvbnNvbGUubG9nKCdsb2wnKVxuXG52YXIgdyA9IDEwMDBcbnZhciBoID0gNTAwXG5cbnZhciBjaXJjbGVfaGVhZF9zZWdtZW50XzBfcmFkaXVzID0gNDBcbnZhciBjaXJjbGVfaGVhZF9zZWdtZW50XzFfcmFkaXVzID0gMzBcblxudmFyIGQzID0gd2luZG93LmQzXG5cbnZhciBkaXZfa3Jha2VuID0gZDMuc2VsZWN0KCdkaXYja3Jha2VuJylcbnZhciBzdmcgPSBkaXZfa3Jha2VuLmFwcGVuZCgnc3ZnJylcbiAgLmF0dHIoJ3ZpZXdCb3gnLCAnMCAwICcgKyB3ICsgJyAnICsgaClcbiAgLmF0dHIoJ3dpZHRoJywgJzEwMCUnKVxuICAuYXR0cigncHJlc2VydmVBc3BlY3RSYXRpbycsICd4TWlkWU1pZCcpXG4gIC5zdHlsZSgnYmFja2dyb3VuZC1jb2xvcicsICdyZ2JhKDAsMCwwLDAuMyknKVxuXG52YXIgYXJtX21ha2VyID0gcmVxdWlyZSgnLi9jcmVhdGUvYXJtLmpzJylcbnZhciBhcm1zID0gW11cblxuZm9yICh2YXIgaSA9IDA7IGkgPCA4OyBpKyspIHtcbiAgYXJtcy5wdXNoKGFybV9tYWtlcih7XG4gICAgcGFyZW50OiBzdmcsXG4gICAgZGlzdGFuY2U6IDEwLFxuICAgIGNvdW50OiA4XG4gIH0pKVxufVxuXG52YXIgaGVhZF9saWdhbWVudHMgPSBhcm1fbWFrZXIoe1xuICBwYXJlbnQ6IHN2ZyxcbiAgZGlzdGFuY2U6IDEsXG4gIGNvdW50OiAxXG59KVxuXG4vLyBoZWFkX2xpZ2FtZW50cy5zaW11bGF0aW9uLnZlbG9jaXR5RGVjYXkoMC4wMSlcbi8vIGhlYWRfbGlnYW1lbnRzLnNpbXVsYXRpb24uZm9yY2UoJ2xpbmsnKS5zdHJlbmd0aCgxKVxuXG5jb25zb2xlLmxvZyhoZWFkX2xpZ2FtZW50cylcblxudmFyIGhlYWRfcG9zaXRpb24gPSB7XG4gIHg6IHcgKiAwLjUsXG4gIHk6IGggKiAwLjUsXG4gIHZ4OiBNYXRoLnJhbmRvbSgpIC0gMC41LFxuICB2eTogTWF0aC5yYW5kb20oKSAtIDAuNSxcbiAgbmV3X3Z4OiAwLFxuICBuZXdfdnk6IDAsXG4gIHI6IDUwLFxuICB0cmFuc2l0aW9uX3RyaWdnZXJlZDogZmFsc2Vcbn1cblxuLy8gdmFyIGNpcmNsZV9oZWFkX3NlZ21lbnRfMCA9IHN2Zy5hcHBlbmQoJ2VsbGlwc2UnKS5hdHRyKCdjeCcsIDApLmF0dHIoJ2N5JywgMCkuYXR0cigncngnLCBjaXJjbGVfaGVhZF9zZWdtZW50XzBfcmFkaXVzKS5hdHRyKCdyeScsIGNpcmNsZV9oZWFkX3NlZ21lbnRfMF9yYWRpdXMpLmF0dHIoJ2ZpbGwnLCAnYmxhY2snKVxuLy8gdmFyIGNpcmNsZV9oZWFkX3NlZ21lbnRfMSA9IHN2Zy5hcHBlbmQoJ2VsbGlwc2UnKS5hdHRyKCdjeCcsIDApLmF0dHIoJ2N5JywgMCkuYXR0cigncngnLCBjaXJjbGVfaGVhZF9zZWdtZW50XzFfcmFkaXVzKS5hdHRyKCdyeScsIGNpcmNsZV9oZWFkX3NlZ21lbnRfMV9yYWRpdXMpLmF0dHIoJ2ZpbGwnLCAnYmxhY2snKVxuXG52YXIgZ19oZWFkID0gc3ZnLmFwcGVuZCgnZycpLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIGhlYWRfcG9zaXRpb24ueCArICcgJyArIGhlYWRfcG9zaXRpb24ueSArICcpJylcblxudmFyIHNjYWxlX2tyYWtlbl9oZWFkID0gMC40XG52YXIgZ19rcmFrZW5faGVhZCA9IGdfaGVhZC5hcHBlbmQoJ2cnKS5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKDAgMCknKVxudmFyIGdfa3Jha2VuX2hlYWRfc2NhbGUgPSBnX2tyYWtlbl9oZWFkLmFwcGVuZCgnZycpLmF0dHIoJ3RyYW5zZm9ybScsICdzY2FsZSgnICsgW3NjYWxlX2tyYWtlbl9oZWFkLCBzY2FsZV9rcmFrZW5faGVhZF0uam9pbignICcpICsgJyknKVxuXG5nX2tyYWtlbl9oZWFkX3NjYWxlLmFwcGVuZCgncGF0aCcpLmF0dHIoJ2QnLCAnTTE3Mi42NSwxMzIuMzlzLTIxLjg1LTIyLjcyLTM5LjMyLTkuNjFjLTE1Ljk0LDEyLDAsNDAuMiwwLDQwLjJaJykuYXR0cignZmlsbCcsICdibGFjaycpLmF0dHIoJ3N0cm9rZScsICdub25lJylcbmdfa3Jha2VuX2hlYWRfc2NhbGUuYXBwZW5kKCdwYXRoJykuYXR0cignZCcsICdNMTQ4LjQ0LDE0MS43MmwtMjEuMzYtOS4zM1MxMTMuMzUsMTQyLDEyMS4yMiwxNDksMTQ4LjQ0LDE0MS43MiwxNDguNDQsMTQxLjcyWicpLmF0dHIoJ2ZpbGwnLCAnd2hpdGUnKS5hdHRyKCdzdHJva2UnLCAnbm9uZScpXG5nX2tyYWtlbl9oZWFkX3NjYWxlLmFwcGVuZCgncGF0aCcpLmF0dHIoJ2QnLCAnTTc2LjE0LDE3Ny4zNWMxNS4xMS0xNCw1MC4xNC0yNy4zNCw2OC41NS0zOC44NSwxNC04Ljc0LDM1LTEzLjExLDM1LTEzLjExczYuMTItMjUuMzQsMjYuMjEtMjcuMDljNDEuNS0zLjYxLDg2LjU4LDI5LjM1LDg2LjU4LDI5LjM1UzM1NCwxMTkuOCwzOTguNiwxNDMuMzlzOTkuNTQsMTQ1LjQsMjEuNTQsMjIyLjM0Yy02Ny4xOSw2Ni4yOC0xODAtMTguMzgtMTgwLTE4LjM4cy04NC4zNywxNS4xMS0xMjguOTQtMTIuNDJDNjIuODgsMzA1LjEsNTEuNTUsMjAwLjEsNzYuMTQsMTc3LjM1WicpLmF0dHIoJ2ZpbGwnLCAnYmxhY2snKS5hdHRyKCdzdHJva2UnLCAnbm9uZScpXG5nX2tyYWtlbl9oZWFkX3NjYWxlLmFwcGVuZCgncGF0aCcpLmF0dHIoJ2QnLCAnTTE4OC4xNCwxNTguMDVjLTIuNjctOS4zOSwzLTE2LjYxLDEyLTE5LjQ1LDE2LjYtNS4yNCw0MC0zLjc2LDQwLTMuNzZzLTE3LjY4LDMwLjc2LTMxLjY2LDMwLjc2UzE5MC44LDE2Ny40NCwxODguMTQsMTU4LjA1WicpLmF0dHIoJ2ZpbGwnLCAnd2hpdGUnKS5hdHRyKCdzdHJva2UnLCAnbm9uZScpXG5cbi8vIDxwYXRoIGNsYXNzPVwiY2xzLTFcIiBkPVwiTTE3Mi42NSwxMzIuMzlzLTIxLjg1LTIyLjcyLTM5LjMyLTkuNjFjLTE1Ljk0LDEyLDAsNDAuMiwwLDQwLjJaXCIgdHJhbnNmb3JtPVwidHJhbnNsYXRlKC02My41NiAtOTguMDQpXCIvPlxuLy8gPHBhdGggY2xhc3M9XCJjbHMtMlwiIGQ9XCJNMTQ4LjQ0LDE0MS43MmwtMjEuMzYtOS4zM1MxMTMuMzUsMTQyLDEyMS4yMiwxNDksMTQ4LjQ0LDE0MS43MiwxNDguNDQsMTQxLjcyWlwiIHRyYW5zZm9ybT1cInRyYW5zbGF0ZSgtNjMuNTYgLTk4LjA0KVwiLz5cbi8vIDxwYXRoIGNsYXNzPVwiY2xzLTFcIiBkPVwiTTc2LjE0LDE3Ny4zNWMxNS4xMS0xNCw1MC4xNC0yNy4zNCw2OC41NS0zOC44NSwxNC04Ljc0LDM1LTEzLjExLDM1LTEzLjExczYuMTItMjUuMzQsMjYuMjEtMjcuMDljNDEuNS0zLjYxLDg2LjU4LDI5LjM1LDg2LjU4LDI5LjM1UzM1NCwxMTkuOCwzOTguNiwxNDMuMzlzOTkuNTQsMTQ1LjQsMjEuNTQsMjIyLjM0Yy02Ny4xOSw2Ni4yOC0xODAtMTguMzgtMTgwLTE4LjM4cy04NC4zNywxNS4xMS0xMjguOTQtMTIuNDJDNjIuODgsMzA1LjEsNTEuNTUsMjAwLjEsNzYuMTQsMTc3LjM1WlwiIHRyYW5zZm9ybT1cInRyYW5zbGF0ZSgtNjMuNTYgLTk4LjA0KVwiLz5cbi8vIDxwYXRoIGNsYXNzPVwiY2xzLTJcIiBkPVwiTTE4OC4xNCwxNTguMDVjLTIuNjctOS4zOSwzLTE2LjYxLDEyLTE5LjQ1LDE2LjYtNS4yNCw0MC0zLjc2LDQwLTMuNzZzLTE3LjY4LDMwLjc2LTMxLjY2LDMwLjc2UzE5MC44LDE2Ny40NCwxODguMTQsMTU4LjA1WlwiIHRyYW5zZm9ybT1cInRyYW5zbGF0ZSgtNjMuNTYgLTk4LjA0KVwiLz5cblxudmFyIGNpcmNsZV9oZWFkID0gZ19oZWFkLmFwcGVuZCgnY2lyY2xlJylcbiAgLmF0dHIoJ2N4JywgMClcbiAgLmF0dHIoJ2ZpbGwnLCAnbm9uZScpXG4gIC5hdHRyKCdjeScsIDApLmF0dHIoJ3InLCBoZWFkX3Bvc2l0aW9uLnIpXG4gIC5hdHRyKCdzdHJva2UnLCAnbm9uZScpXG5cbnZhciBnX2V5ZV9sID0gZ19oZWFkLmFwcGVuZCgnZycpLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoLTE1IC0xMCknKS5hdHRyKCdvcGFjaXR5JywgMClcbnZhciBnX2V5ZV9yID0gZ19oZWFkLmFwcGVuZCgnZycpLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoMTUgLTEwKScpLmF0dHIoJ29wYWNpdHknLCAwKVxudmFyIGNpcmNsZV9leWViYWNrX2wgPSBnX2V5ZV9sLmFwcGVuZCgnY2lyY2xlJykuYXR0cignY3gnLCAwKS5hdHRyKCdjeScsIDApLmF0dHIoJ3InLCAxMCkuYXR0cignZmlsbCcsICd3aGl0ZScpLmF0dHIoJ3RyYW5zZm9ybScsICdzY2FsZSgxLjAgMC43KScpXG52YXIgY2lyY2xlX2V5ZWJhY2tfciA9IGdfZXllX3IuYXBwZW5kKCdjaXJjbGUnKS5hdHRyKCdjeCcsIDApLmF0dHIoJ2N5JywgMCkuYXR0cigncicsIDEwKS5hdHRyKCdmaWxsJywgJ3doaXRlJykuYXR0cigndHJhbnNmb3JtJywgJ3NjYWxlKDEuMCAwLjcpJylcbnZhciBjaXJjbGVfZXllYmFsbF9sID0gZ19leWVfbC5hcHBlbmQoJ2NpcmNsZScpLmF0dHIoJ2N4JywgMCkuYXR0cignY3knLCAwKS5hdHRyKCdyJywgMikuYXR0cignZmlsbCcsICdyZ2JhKDAsMCwwLDAuOSknKSAvLyAuYXR0cignc3Ryb2tlJywgJ2dyZWVuJykuYXR0cignc3Ryb2tlLXdpZHRoJywgMS41KVxudmFyIGNpcmNsZV9leWViYWxsX3IgPSBnX2V5ZV9yLmFwcGVuZCgnY2lyY2xlJykuYXR0cignY3gnLCAwKS5hdHRyKCdjeScsIDApLmF0dHIoJ3InLCAyKS5hdHRyKCdmaWxsJywgJ3JnYmEoMCwwLDAsMC45KScpIC8vIC5hdHRyKCdzdHJva2UnLCAnZ3JlZW4nKS5hdHRyKCdzdHJva2Utd2lkdGgnLCAxLjUpXG5cbnZhciBibGlua190aW1lb3V0LCBibGlua190aW1lb3V0MlxuZnVuY3Rpb24gYmxpbmsgKCkge1xuICBjbGVhclRpbWVvdXQoYmxpbmtfdGltZW91dClcbiAgY2xlYXJUaW1lb3V0KGJsaW5rX3RpbWVvdXQyKVxuICB2YXIgZHVyYXRpb24gPSAyMFxuICBjaXJjbGVfZXllYmFja19sLnRyYW5zaXRpb24oKS5hdHRyKCd0cmFuc2Zvcm0nLCAnc2NhbGUoMS4wIDAuMSknKS5lYXNlKGQzLmVhc2VMaW5lYXIpLmR1cmF0aW9uKGR1cmF0aW9uKVxuICBjaXJjbGVfZXllYmFja19yLnRyYW5zaXRpb24oKS5hdHRyKCd0cmFuc2Zvcm0nLCAnc2NhbGUoMS4wIDAuMSknKS5lYXNlKGQzLmVhc2VMaW5lYXIpLmR1cmF0aW9uKGR1cmF0aW9uKVxuICBibGlua190aW1lb3V0MiA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgIGNsZWFyVGltZW91dChibGlua190aW1lb3V0KVxuICAgIGNpcmNsZV9leWViYWNrX2wudHJhbnNpdGlvbigpLmF0dHIoJ3RyYW5zZm9ybScsICdzY2FsZSgxLjAgMC43KScpLmVhc2UoZDMuZWFzZUxpbmVhcilcbiAgICBjaXJjbGVfZXllYmFja19yLnRyYW5zaXRpb24oKS5hdHRyKCd0cmFuc2Zvcm0nLCAnc2NhbGUoMS4wIDAuNyknKS5lYXNlKGQzLmVhc2VMaW5lYXIpXG4gICAgYmxpbmtfdGltZW91dCA9IHNldFRpbWVvdXQoYmxpbmssIChNYXRoLnJhbmRvbSgpICogNTAwMCkpXG4gIH0sIGR1cmF0aW9uKVxufVxuYmxpbmsoKVxuXG52YXIgdGljayA9IGZ1bmN0aW9uICgpIHtcbiAgaGVhZF9wb3NpdGlvbi54ICs9IGhlYWRfcG9zaXRpb24udnhcbiAgaGVhZF9wb3NpdGlvbi55ICs9IGhlYWRfcG9zaXRpb24udnlcblxuICB2YXIgc2NhbGVfeCA9IHNjYWxlX2tyYWtlbl9oZWFkXG4gIHZhciBzY2FsZV95ID0gc2NhbGVfa3Jha2VuX2hlYWRcbiAgaWYgKGhlYWRfcG9zaXRpb24udnggPCAwKSB7XG4gICAgZ19rcmFrZW5faGVhZF9zY2FsZS5hdHRyKCd0cmFuc2Zvcm0nLCAnc2NhbGUoJyArIFtzY2FsZV94LCBzY2FsZV95XS5qb2luKCcgJykgKyAnKScpXG4gICAgZ19rcmFrZW5faGVhZC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKC0xMDAgLTEyMCknKVxuICB9IGVsc2Uge1xuICAgIGdfa3Jha2VuX2hlYWRfc2NhbGUuYXR0cigndHJhbnNmb3JtJywgJ3NjYWxlKCcgKyBbLXNjYWxlX3gsIHNjYWxlX3ldLmpvaW4oJyAnKSArICcpJylcbiAgICBnX2tyYWtlbl9oZWFkLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoMTAwIC0xMjApJylcbiAgfVxuXG4gIGhlYWRfbGlnYW1lbnRzLnNpbXVsYXRpb24ubm9kZXMoKVswXS54ID0gaGVhZF9wb3NpdGlvbi54XG4gIGhlYWRfbGlnYW1lbnRzLnNpbXVsYXRpb24ubm9kZXMoKVswXS55ID0gaGVhZF9wb3NpdGlvbi55XG5cbiAgdmFyIHIgPSAyMFxuXG4gIHZhciBkaXJ0eV9mcm9tX3dhbGwgPSBmYWxzZVxuICBpZiAoaGVhZF9wb3NpdGlvbi54ID4gdykge1xuICAgIGRpcnR5X2Zyb21fd2FsbCA9IHRydWVcbiAgICBoZWFkX3Bvc2l0aW9uLnggLT0gKGhlYWRfcG9zaXRpb24ueCAtIHcpXG4gICAgaGVhZF9wb3NpdGlvbi52eCAqPSAtMVxuICB9XG4gIGlmIChoZWFkX3Bvc2l0aW9uLnggPCAwKSB7XG4gICAgZGlydHlfZnJvbV93YWxsID0gdHJ1ZVxuICAgIGhlYWRfcG9zaXRpb24ueCArPSAoLWhlYWRfcG9zaXRpb24ueClcbiAgICBoZWFkX3Bvc2l0aW9uLnZ4ICo9IC0xXG4gIH1cbiAgaWYgKGhlYWRfcG9zaXRpb24ueSA+IGgpIHtcbiAgICBkaXJ0eV9mcm9tX3dhbGwgPSB0cnVlXG4gICAgaGVhZF9wb3NpdGlvbi55IC09IChoZWFkX3Bvc2l0aW9uLnkgLSBoKVxuICAgIGhlYWRfcG9zaXRpb24udnkgKj0gLTFcbiAgfVxuICBpZiAoaGVhZF9wb3NpdGlvbi55IDwgMCkge1xuICAgIGRpcnR5X2Zyb21fd2FsbCA9IHRydWVcbiAgICBoZWFkX3Bvc2l0aW9uLnkgKz0gKC1oZWFkX3Bvc2l0aW9uLnkpXG4gICAgaGVhZF9wb3NpdGlvbi52eSAqPSAtMVxuICB9XG5cbiAgaWYgKGRpcnR5X2Zyb21fd2FsbCkge1xuICAgIGNpcmNsZV9leWViYWxsX2wudHJhbnNpdGlvbigpLmF0dHIoJ2N4JywgaGVhZF9wb3NpdGlvbi52eCkuYXR0cignY3knLCBoZWFkX3Bvc2l0aW9uLnZ5KVxuICAgIGNpcmNsZV9leWViYWxsX3IudHJhbnNpdGlvbigpLmF0dHIoJ2N4JywgaGVhZF9wb3NpdGlvbi52eCkuYXR0cignY3knLCBoZWFkX3Bvc2l0aW9uLnZ5KVxuICAgIGJsaW5rKClcbiAgfVxuXG4gIGdfaGVhZC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBoZWFkX3Bvc2l0aW9uLnggKyAnICcgKyBoZWFkX3Bvc2l0aW9uLnkgKyAnKScpXG5cbiAgdmFyIGhlYWRfZGFtcGVuaW5nID0gMC45OVxuICB2YXIgYWxwaGEgPSBoZWFkX3Bvc2l0aW9uLnZ4XG4gIGhlYWRfcG9zaXRpb24udnggKj0gaGVhZF9kYW1wZW5pbmdcbiAgaGVhZF9wb3NpdGlvbi52eSAqPSBoZWFkX2RhbXBlbmluZ1xuXG4gIC8vIG1vdmUgaGVhZCByYW5kb21seVxuICBpZiAoTWF0aC5hYnMoYWxwaGEgLSBoZWFkX3Bvc2l0aW9uLnZ4KSA8IDAuMDA1ICYmIGhlYWRfcG9zaXRpb24udHJhbnNpdGlvbl90cmlnZ2VyZWQgPT09IGZhbHNlKSB7XG4gICAgaGVhZF9wb3NpdGlvbi50cmFuc2l0aW9uX3RyaWdnZXJlZCA9IHRydWVcbiAgICB2YXIgZHVyYXRpb24gPSAoTWF0aC5yYW5kb20oKSAqIDEwMCkgKyAxXG5cbiAgICAvLyBkZXRlcm1pbmUgaG93IG11Y2ggdGhlIHNxdWlkIGlzIGdvaW5nIHRvIG1vdmVcbiAgICB2YXIgdiA9IGR1cmF0aW9uIC8gMjAuMFxuXG4gICAgLy8gY2lyY2xlX2hlYWRfc2VnbWVudF8wLnRyYW5zaXRpb24oKS5kdXJhdGlvbigyMDAwKS5hdHRyKCdyeCcsIE1hdGgucmFuZG9tKCkgKiAxMCArIGNpcmNsZV9oZWFkX3NlZ21lbnRfMF9yYWRpdXMpLmF0dHIoJ3J5JywgTWF0aC5yYW5kb20oKSAqIDEwICsgY2lyY2xlX2hlYWRfc2VnbWVudF8wX3JhZGl1cykuZWFzZShkMy5lYXNlQm91bmNlKVxuICAgIC8vIGNpcmNsZV9oZWFkX3NlZ21lbnRfMS50cmFuc2l0aW9uKCkuZHVyYXRpb24oMjAwMCkuYXR0cigncngnLCBNYXRoLnJhbmRvbSgpICogMjAgKyBjaXJjbGVfaGVhZF9zZWdtZW50XzFfcmFkaXVzKS5hdHRyKCdyeScsIE1hdGgucmFuZG9tKCkgKiAyMCArIGNpcmNsZV9oZWFkX3NlZ21lbnRfMV9yYWRpdXMpLmVhc2UoZDMuZWFzZUJvdW5jZSlcbiAgICAvLyBoZWFkX2xpZ2FtZW50cy5zaW11bGF0aW9uLmZvcmNlKCdsaW5rJykuc3RyZW5ndGgoMilcblxuICAgIC8vIHNldCBhIG5ldyB2ZWxvY2l0eSBiYXNlZCBvbiByYW5kb20gbnVtYmVyc1xuICAgIGhlYWRfcG9zaXRpb24ubmV3X3Z4ID0gaGVhZF9wb3NpdGlvbi52eCArIChNYXRoLnJhbmRvbSgpICogdikgLSAodiAqIDAuNSlcbiAgICBoZWFkX3Bvc2l0aW9uLm5ld192eSA9IGhlYWRfcG9zaXRpb24udnkgKyAoTWF0aC5yYW5kb20oKSAqIHYpIC0gKHYgKiAwLjUpXG5cbiAgICBoZWFkX3Bvc2l0aW9uLnZ4ICs9IC1oZWFkX3Bvc2l0aW9uLm5ld192eCAqIDAuMjVcbiAgICBoZWFkX3Bvc2l0aW9uLnZ5ICs9IC1oZWFkX3Bvc2l0aW9uLm5ld192eSAqIDAuMjVcblxuICAgIGNpcmNsZV9oZWFkLnRyYW5zaXRpb24oKVxuICAgICAgLmF0dHIoJ3InLCBoZWFkX3Bvc2l0aW9uLnIgLSAoZHVyYXRpb24gLyA1KSlcbiAgICAgIC5lYXNlKGQzLmVhc2VMaW5lYXIpXG4gICAgICAuZHVyYXRpb24oZHVyYXRpb24gKiAyKVxuXG4gICAgY2lyY2xlX2V5ZWJhY2tfbC50cmFuc2l0aW9uKCkuYXR0cigndHJhbnNmb3JtJywgJ3NjYWxlKDEuMCwgMC45KScpXG4gICAgY2lyY2xlX2V5ZWJhY2tfci50cmFuc2l0aW9uKCkuYXR0cigndHJhbnNmb3JtJywgJ3NjYWxlKDEuMCwgMC45KScpXG4gICAgY2lyY2xlX2V5ZWJhbGxfbC50cmFuc2l0aW9uKCkuYXR0cignY3gnLCBoZWFkX3Bvc2l0aW9uLm5ld192eCkuYXR0cignY3knLCBoZWFkX3Bvc2l0aW9uLm5ld192eSkuYXR0cigncicsIDMpLmF0dHIoJ2ZpbGwnLCAncmVkJykuZWFzZShkMy5lYXNlQm91bmNlKVxuICAgIGNpcmNsZV9leWViYWxsX3IudHJhbnNpdGlvbigpLmF0dHIoJ2N4JywgaGVhZF9wb3NpdGlvbi5uZXdfdngpLmF0dHIoJ2N5JywgaGVhZF9wb3NpdGlvbi5uZXdfdnkpLmF0dHIoJ3InLCAzKS5hdHRyKCdmaWxsJywgJ3JlZCcpLmVhc2UoZDMuZWFzZUJvdW5jZSlcblxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgaGVhZF9wb3NpdGlvbi50cmFuc2l0aW9uX3RyaWdnZXJlZCA9IGZhbHNlXG4gICAgICBjaXJjbGVfaGVhZC50cmFuc2l0aW9uKCkuYXR0cigncicsIGhlYWRfcG9zaXRpb24ucilcbiAgICAgICAgLmVhc2UoZDMuZWFzZUVsYXN0aWMpLmR1cmF0aW9uKDEwMDApXG4gICAgICAgIC5kZWxheShkdXJhdGlvbiAvIDIpXG5cbiAgICAgIGNpcmNsZV9leWViYWNrX2wudHJhbnNpdGlvbigpLmF0dHIoJ3RyYW5zZm9ybScsICdzY2FsZSgxLjAsIDAuNyknKVxuICAgICAgY2lyY2xlX2V5ZWJhY2tfci50cmFuc2l0aW9uKCkuYXR0cigndHJhbnNmb3JtJywgJ3NjYWxlKDEuMCwgMC43KScpXG4gICAgICBjaXJjbGVfZXllYmFsbF9sLnRyYW5zaXRpb24oKS5hdHRyKCdmaWxsJywgJ3JnYmEoMCwwLDAsMC45KScpLmF0dHIoJ3InLCAyKS5kdXJhdGlvbigxMDAwKS5lYXNlKGQzLmVhc2VFbGFzdGljKVxuICAgICAgY2lyY2xlX2V5ZWJhbGxfci50cmFuc2l0aW9uKCkuYXR0cignZmlsbCcsICdyZ2JhKDAsMCwwLDAuOSknKS5hdHRyKCdyJywgMikuZHVyYXRpb24oMTAwMCkuZWFzZShkMy5lYXNlRWxhc3RpYylcblxuICAgICAgaGVhZF9wb3NpdGlvbi52eCA9IGhlYWRfcG9zaXRpb24ubmV3X3Z4XG4gICAgICBoZWFkX3Bvc2l0aW9uLnZ5ID0gaGVhZF9wb3NpdGlvbi5uZXdfdnlcblxuICAgICAgLy9cbiAgICAgIGFybXMuZm9yRWFjaChmdW5jdGlvbiAoYXJtKSB7XG4gICAgICAgIGFybS5zaW11bGF0aW9uLmFscGhhKChNYXRoLnJhbmRvbSgpICogMC4zKSArIDAuMSlcbiAgICAgICAgYXJtLnNpbXVsYXRpb24ucmVzdGFydCgpXG4gICAgICB9KVxuICAgIH0sIGR1cmF0aW9uICogNSlcbiAgfVxuXG4gIC8vIGF0dHJhY3Qgbm9kZXNcbiAgLy8gYXJtcy5mb3JFYWNoKGZ1bmN0aW9uIChhcm0sIGlkeCkge1xuICAvLyAgIHZhciBub2RlcyA9IGFybS5zaW11bGF0aW9uLm5vZGVzKClcbiAgLy8gICB2YXIgdGFyZ2V0X3ggPSB3IC8gKGlkeCArIDEpXG4gIC8vICAgdmFyIHRhcmdldF95ID0gMTBcbiAgLy8gICB2YXIgYXJtX3RpcCA9IG5vZGVzW25vZGVzLmxlbmd0aCAtIDFdXG4gIC8vXG4gIC8vICAgdmFyIGRpc3RhbmNlX3ggPSB0YXJnZXRfeCAtIGFybV90aXAueFxuICAvLyAgIHZhciBkaXN0YW5jZV95ID0gdGFyZ2V0X3kgLSBhcm1fdGlwLnlcbiAgLy9cbiAgLy8gICBhcm1fdGlwLnggKz0gZGlzdGFuY2VfeCAvIDEwXG4gIC8vICAgYXJtX3RpcC55ICs9IGRpc3RhbmNlX3kgLyAxMFxuICAvLyB9KVxuXG4gIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGljaylcbn1cbnRpY2soKVxuXG5oZWFkX2xpZ2FtZW50cy5zaW11bGF0aW9uLm9uKCd0aWNrJywgZnVuY3Rpb24gKCkge1xuICB2YXIgc2ltdWxhdGlvbiA9IGhlYWRfbGlnYW1lbnRzLnNpbXVsYXRpb25cbiAgdmFyIG5vZGVzID0gc2ltdWxhdGlvbi5ub2RlcygpXG4gIHZhciBsaW5rcyA9IGhlYWRfbGlnYW1lbnRzLmxpbmtzXG4gIHZhciBsaW5rID0gaGVhZF9saWdhbWVudHMubGlua1xuICB2YXIgbm9kZSA9IGhlYWRfbGlnYW1lbnRzLm5vZGVcbiAgdmFyIGRhdGEgPSBoZWFkX2xpZ2FtZW50cy5kYXRhXG4gIG5vZGVzWzBdLnggPSBoZWFkX3Bvc2l0aW9uLnhcbiAgbm9kZXNbMF0ueSA9IGhlYWRfcG9zaXRpb24ueVxuXG4gIC8vIGNpcmNsZV9oZWFkX3NlZ21lbnRfMC5hdHRyKCdjeCcsIG5vZGVzWzFdLngpXG4gIC8vIGNpcmNsZV9oZWFkX3NlZ21lbnRfMC5hdHRyKCdjeScsIG5vZGVzWzFdLnkpXG4gIC8vIGNpcmNsZV9oZWFkX3NlZ21lbnRfMS5hdHRyKCdjeCcsIG5vZGVzWzBdLngpXG4gIC8vIGNpcmNsZV9oZWFkX3NlZ21lbnRfMS5hdHRyKCdjeScsIG5vZGVzWzBdLnkpXG5cbiAgaGVhZF9saWdhbWVudHMubGluay5hdHRyKCd4MScsIGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLnNvdXJjZS54IH0pXG4gICAgLmF0dHIoJ3kxJywgZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQuc291cmNlLnkgfSlcbiAgICAuYXR0cigneDInLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC50YXJnZXQueCB9KVxuICAgIC5hdHRyKCd5MicsIGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLnRhcmdldC55IH0pXG59KVxuaGVhZF9saWdhbWVudHMuc2ltdWxhdGlvbi5vbignZW5kJywgZnVuY3Rpb24gKCkge1xuICBoZWFkX2xpZ2FtZW50cy5zaW11bGF0aW9uLmFscGhhKDAuMSlcbiAgaGVhZF9saWdhbWVudHMuc2ltdWxhdGlvbi5yZXN0YXJ0KClcbn0pXG5cbmFybXMuZm9yRWFjaChmdW5jdGlvbiAoYXJtKSB7XG4gIHZhciBzaW11bGF0aW9uID0gYXJtLnNpbXVsYXRpb25cbiAgdmFyIG5vZGVzID0gc2ltdWxhdGlvbi5ub2RlcygpXG4gIHZhciBsaW5rcyA9IGFybS5saW5rc1xuICB2YXIgbGluayA9IGFybS5saW5rXG4gIHZhciBub2RlID0gYXJtLm5vZGVcbiAgdmFyIGRhdGEgPSBhcm0uZGF0YVxuXG4gIHNpbXVsYXRpb24ub24oJ3RpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgbm9kZXNbMF0ueCA9IGhlYWRfcG9zaXRpb24ueFxuICAgIG5vZGVzWzBdLnkgPSBoZWFkX3Bvc2l0aW9uLnlcblxuICAgIGlmICh3aW5kb3cudXNlX3BhdGggPT09IHRydWUpIHtcbiAgICAgIGRhdGEgPSBbXVxuICAgICAgbm9kZXMuZm9yRWFjaChmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICBkYXRhLnB1c2goeyB4OiBub2RlLngsIHk6IG5vZGUueSB9KVxuICAgICAgfSlcbiAgICAgIGFybS5saW5rLmRhdHVtKGRhdGEpLnRyYW5zaXRpb24oKVxuICAgICAgICAuYXR0cignZCcsIGFybS5saW5lX2dlbmVyYXRvcilcbiAgICB9IGVsc2Uge1xuICAgICAgYXJtLmxpbmsuYXR0cigneDEnLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC5zb3VyY2UueCB9KVxuICAgICAgICAuYXR0cigneTEnLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC5zb3VyY2UueSB9KVxuICAgICAgICAuYXR0cigneDInLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC50YXJnZXQueCB9KVxuICAgICAgICAuYXR0cigneTInLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC50YXJnZXQueSB9KVxuICAgIH1cbiAgICBub2RlLmF0dHIoJ3RyYW5zZm9ybScsIGZ1bmN0aW9uIChkLCBpKSB7XG4gICAgICByZXR1cm4gJ3RyYW5zbGF0ZSgnICsgZC54ICsgJyAnICsgZC55ICsgJyknXG4gICAgfSlcbiAgfSlcblxuICBzaW11bGF0aW9uLm9uKCdlbmQnLCBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2coJ2VuZCcpXG4gICAgbm9kZXMuZm9yRWFjaChmdW5jdGlvbiAobm9kZSwgaWR4KSB7XG4gICAgICB2YXIgdiA9IDEuMFxuICAgICAgbm9kZS52eCArPSAoTWF0aC5yYW5kb20oKSAqIHYpIC0gKHYgKiAwLjUpXG4gICAgICBub2RlLnZ5ICs9IChNYXRoLnJhbmRvbSgpICogdikgLSAodiAqIDAuNSlcbiAgICB9KVxuICAgIHNpbXVsYXRpb24uYWxwaGEoKE1hdGgucmFuZG9tKCkgKiAwLjMpICsgMC4xKVxuICAgIHNpbXVsYXRpb24ucmVzdGFydCgpXG4gIH0pXG59KVxuIl19
