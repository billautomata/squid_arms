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
      do_link: (i < (n_segments - 1))
        && ((i % count) !== (count - 1))
        && i >= 0
    })
    // console.log(i, i % count, (
    //   (i < (n_segments - 1))
    //   && ((i % count) !== (count - 1))
    //   && i >= 0
    //   ))
    if ((i < (n_segments - 1))
      && ((i % count) !== (count - 1))
      && i >= 0
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
    .force('many', d3.forceManyBody().strength(-2))
    // .force('center', d3.forceCenter().x(500).y(250))

  simulation.nodes(nodes)
  simulation.force('link').links(links)

  window.s = simulation

  nodes.forEach(function (node, idx) {
    // console.log(link)
    var v = 1.0
    node.x = 500 + (Math.random() * v) - (v * 0.5)
    node.y = 250 + (Math.random() * v) - (v * 0.5)
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

  if (window.use_path === true) {
    nodes.forEach(function (node) {
      data.push({ x: node.x, y: node.y })
    })

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

console.log('lol')

var w = window.innerWidth
var h = window.innerHeight

window.addEventListener('resize', function () {
  console.log('resize')

  w = window.innerWidth
  h = window.innerHeight

  svg.attr('viewBox', '0 0 ' + w + ' ' + h)
    .attr('width', w)
    .attr('height', h)
})

var circle_head_segment_0_radius = 40
var circle_head_segment_1_radius = 30

var d3 = window.d3

var div_kraken = d3.select('div#kraken')
var svg = div_kraken.append('svg')
  .attr('viewBox', '0 0 ' + w + ' ' + h)
  .attr('width', w)
  .attr('height', h)
  .attr('preserveAspectRatio', 'xMidYMid')
  .style('background-color', 'rgba(0,0,0,0.3)')

var arm_maker = require('./create/arm.js')
var arms = []

for (var i = 0; i < 1; i++) {
  arms.push(arm_maker({
    parent: svg,
    distance: 2,
    count: 10,
    n_arms: 8
  }))
}

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

var g_head = svg.append('g').attr('transform', 'translate(' + head_position.x + ' ' + head_position.y + ')')

var scale_kraken_head = 0.4
var g_kraken_head = g_head.append('g').attr('transform', 'translate(0 0)')
var g_kraken_head_scale = g_kraken_head.append('g').attr('transform', 'scale(' + [scale_kraken_head, scale_kraken_head].join(' ') + ')')

g_kraken_head_scale.append('path').attr('d', 'M172.65,132.39s-21.85-22.72-39.32-9.61c-15.94,12,0,40.2,0,40.2Z').attr('fill', 'black').attr('stroke', 'none')
g_kraken_head_scale.append('path').attr('d', 'M148.44,141.72l-21.36-9.33S113.35,142,121.22,149,148.44,141.72,148.44,141.72Z').attr('fill', 'white').attr('stroke', 'none')
g_kraken_head_scale.append('path').attr('d', 'M76.14,177.35c15.11-14,50.14-27.34,68.55-38.85,14-8.74,35-13.11,35-13.11s6.12-25.34,26.21-27.09c41.5-3.61,86.58,29.35,86.58,29.35S354,119.8,398.6,143.39s99.54,145.4,21.54,222.34c-67.19,66.28-180-18.38-180-18.38s-84.37,15.11-128.94-12.42C62.88,305.1,51.55,200.1,76.14,177.35Z').attr('fill', 'black').attr('stroke', 'none')
g_kraken_head_scale.append('path').attr('d', 'M188.14,158.05c-2.67-9.39,3-16.61,12-19.45,16.6-5.24,40-3.76,40-3.76s-17.68,30.76-31.66,30.76S190.8,167.44,188.14,158.05Z').attr('fill', 'white').attr('stroke', 'none')

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
    var v = duration / 10.0

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
      nodes[i].x = head_position.x
      nodes[i].y = head_position.y
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

},{"./create/arm.js":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJrcmFrZW4vY3JlYXRlL2FybS5qcyIsImtyYWtlbi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYXJtIChvcHRpb25zKSB7XG4gIHZhciBub2RlcyA9IFtdXG4gIHZhciBsaW5rcyA9IFtdXG4gIHZhciBuX2FybXMgPSBvcHRpb25zLm5fYXJtc1xuICB2YXIgY291bnQgPSBvcHRpb25zLmNvdW50XG5cbiAgdmFyIG5fc2VnbWVudHMgPSBuX2FybXMgKiBjb3VudFxuXG4gIGNvbnNvbGUubG9nKCduX2FybXMnLCBuX2FybXMpXG4gIGNvbnNvbGUubG9nKCdzZWdtZW50c19wZXJfYXJtJywgY291bnQpXG4gIGNvbnNvbGUubG9nKCd0b3RhbF9zZWdtZW50cycsIG5fc2VnbWVudHMpXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBuX3NlZ21lbnRzOyBpKyspIHtcbiAgICBub2Rlcy5wdXNoKHtcbiAgICAgIG5hbWU6IGksXG4gICAgICB0eXBlOiAnbmEnLFxuICAgICAgZG9fbGluazogKGkgPCAobl9zZWdtZW50cyAtIDEpKVxuICAgICAgICAmJiAoKGkgJSBjb3VudCkgIT09IChjb3VudCAtIDEpKVxuICAgICAgICAmJiBpID49IDBcbiAgICB9KVxuICAgIC8vIGNvbnNvbGUubG9nKGksIGkgJSBjb3VudCwgKFxuICAgIC8vICAgKGkgPCAobl9zZWdtZW50cyAtIDEpKVxuICAgIC8vICAgJiYgKChpICUgY291bnQpICE9PSAoY291bnQgLSAxKSlcbiAgICAvLyAgICYmIGkgPj0gMFxuICAgIC8vICAgKSlcbiAgICBpZiAoKGkgPCAobl9zZWdtZW50cyAtIDEpKVxuICAgICAgJiYgKChpICUgY291bnQpICE9PSAoY291bnQgLSAxKSlcbiAgICAgICYmIGkgPj0gMFxuICAgICkge1xuICAgICAgbGlua3MucHVzaCh7XG4gICAgICAgIHNvdXJjZTogaSxcbiAgICAgICAgdGFyZ2V0OiBpICsgMSxcbiAgICAgICAgdmFsdWU6IGkgJSBjb3VudFxuICAgICAgfSlcbiAgICB9XG4gIH1cbiAgdmFyIGQzID0gd2luZG93LmQzXG5cbiAgdmFyIHNpbXVsYXRpb24gPSBkMy5mb3JjZVNpbXVsYXRpb24oKVxuICAgIC52ZWxvY2l0eURlY2F5KDAuMDEpXG4gICAgLmZvcmNlKCdsaW5rJywgZDMuZm9yY2VMaW5rKCkuaWQoZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQubmFtZSB9KVxuICAgICAgLmRpc3RhbmNlKGZ1bmN0aW9uIChkLCBpKSB7IHJldHVybiAoY291bnQgLSAoaSAlIGNvdW50KSArIDEpICogb3B0aW9ucy5kaXN0YW5jZSB9KVxuICApXG4gICAgLmZvcmNlKCdtYW55JywgZDMuZm9yY2VNYW55Qm9keSgpLnN0cmVuZ3RoKC0yKSlcbiAgICAvLyAuZm9yY2UoJ2NlbnRlcicsIGQzLmZvcmNlQ2VudGVyKCkueCg1MDApLnkoMjUwKSlcblxuICBzaW11bGF0aW9uLm5vZGVzKG5vZGVzKVxuICBzaW11bGF0aW9uLmZvcmNlKCdsaW5rJykubGlua3MobGlua3MpXG5cbiAgd2luZG93LnMgPSBzaW11bGF0aW9uXG5cbiAgbm9kZXMuZm9yRWFjaChmdW5jdGlvbiAobm9kZSwgaWR4KSB7XG4gICAgLy8gY29uc29sZS5sb2cobGluaylcbiAgICB2YXIgdiA9IDEuMFxuICAgIG5vZGUueCA9IDUwMCArIChNYXRoLnJhbmRvbSgpICogdikgLSAodiAqIDAuNSlcbiAgICBub2RlLnkgPSAyNTAgKyAoTWF0aC5yYW5kb20oKSAqIHYpIC0gKHYgKiAwLjUpXG4gICAgbm9kZS52eCArPSAoTWF0aC5yYW5kb20oKSAqIHYpIC0gKHYgKiAwLjUpXG4gICAgbm9kZS52eSArPSAoTWF0aC5yYW5kb20oKSAqIHYpIC0gKHYgKiAwLjUpXG4gIH0pXG5cbiAgdmFyIHN2ZyA9IG9wdGlvbnMucGFyZW50XG5cbiAgdmFyIHJhbmRvbV9yYW5nZV9kaXN0YW5jZSA9IDMwXG4gIHZhciBvZmZzZXRfeCA9IChNYXRoLnJhbmRvbSgpICogcmFuZG9tX3JhbmdlX2Rpc3RhbmNlKSAtIChyYW5kb21fcmFuZ2VfZGlzdGFuY2UgKiAwLjUpXG4gIHZhciBvZmZzZXRfeSA9IChNYXRoLnJhbmRvbSgpICogcmFuZG9tX3JhbmdlX2Rpc3RhbmNlKSAtIChyYW5kb21fcmFuZ2VfZGlzdGFuY2UgKiAwLjUpXG5cbiAgc3ZnID0gc3ZnLmFwcGVuZCgnZycpXG4gICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIG9mZnNldF94ICsgJyAnICsgb2Zmc2V0X3kgKyAnKScpXG5cbiAgdmFyIGxpbmVfZ2VuZXJhdG9yID0gZDMubGluZSgpXG4gICAgLngoZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQueCB9KVxuICAgIC55KGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLnkgfSlcbiAgICAuY3VydmUoZDMuY3VydmVDYXRtdWxsUm9tLmFscGhhKDEuMCkpXG5cbiAgdmFyIGRhdGEgPSBbXVxuXG4gIGlmICh3aW5kb3cudXNlX3BhdGggPT09IHRydWUpIHtcbiAgICBub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICBkYXRhLnB1c2goeyB4OiBub2RlLngsIHk6IG5vZGUueSB9KVxuICAgIH0pXG5cbiAgICB2YXIgbGluayA9IHN2Zy5hcHBlbmQoJ3BhdGgnKVxuICAgICAgLmRhdHVtKGRhdGEpXG4gICAgICAuYXR0cignZCcsIGxpbmVfZ2VuZXJhdG9yKVxuICAgICAgLmF0dHIoJ2NsYXNzJywgJ2xpbmsnKVxuICAgICAgLmF0dHIoJ3N0cm9rZScsICdibGFjaycpXG4gICAgICAuYXR0cignZmlsbCcsICdub25lJylcbiAgICAgIC5hdHRyKCdzdHJva2UtbGluZWNhcCcsICdyb3VuZCcpXG4gICAgICAuc3R5bGUoJ3N0cm9rZS1vcGFjaXR5JywgMS4wKVxuICAgICAgLnN0eWxlKCdzdHJva2Utd2lkdGgnLCAzKVxuICB9IGVsc2Uge1xuICAgIHZhciBsaW5rID0gc3ZnLnNlbGVjdEFsbCgnLmxpbmsnKVxuICAgICAgLmRhdGEobGlua3MpXG4gICAgICAuZW50ZXIoKS5hcHBlbmQoJ2xpbmUnKVxuICAgICAgLmF0dHIoJ2NsYXNzJywgJ2xpbmsnKVxuICAgICAgLmF0dHIoJ3N0cm9rZScsICdibGFjaycpXG4gICAgICAuYXR0cignZmlsbCcsICdub25lJylcbiAgICAgIC5hdHRyKCdzdHJva2UtbGluZWNhcCcsICdyb3VuZCcpXG4gICAgICAuc3R5bGUoJ3N0cm9rZS1vcGFjaXR5JywgMS4wKVxuICAgICAgLnN0eWxlKCdzdHJva2Utd2lkdGgnLCBmdW5jdGlvbiAoZCwgaSkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhkLnZhbHVlLCBpLCBjb3VudCAtIGQudmFsdWUpXG4gICAgICAgIHJldHVybiAoY291bnQgLSBkLnZhbHVlKSAqIDNcbiAgICAgIH0pXG4gIH1cblxuICB2YXIgbm9kZSA9IHN2Zy5zZWxlY3RBbGwoJy5ub2RlJylcbiAgICAuZGF0YShub2RlcylcbiAgICAuZW50ZXIoKS5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdub2RlJylcblxuICByZXR1cm4ge1xuICAgIHNpbXVsYXRpb246IHNpbXVsYXRpb24sXG4gICAgbGluazogbGluayxcbiAgICBsaW5rczogbGlua3MsXG4gICAgbm9kZTogbm9kZSxcbiAgICBsaW5lX2dlbmVyYXRvcjogbGluZV9nZW5lcmF0b3IsXG4gICAgZGF0YTogZGF0YSxcbiAgICBjb3VudDogY291bnQsXG4gICAgbl9hcm1zOiBuX2FybXNcbiAgfVxufVxuIiwiY29uc29sZS5sb2coJ2hlbGxvIGZyb20gdGhlIGtyYWtlbiEnKVxuXG5jb25zb2xlLmxvZygnbG9sJylcblxudmFyIHcgPSB3aW5kb3cuaW5uZXJXaWR0aFxudmFyIGggPSB3aW5kb3cuaW5uZXJIZWlnaHRcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcbiAgY29uc29sZS5sb2coJ3Jlc2l6ZScpXG5cbiAgdyA9IHdpbmRvdy5pbm5lcldpZHRoXG4gIGggPSB3aW5kb3cuaW5uZXJIZWlnaHRcblxuICBzdmcuYXR0cigndmlld0JveCcsICcwIDAgJyArIHcgKyAnICcgKyBoKVxuICAgIC5hdHRyKCd3aWR0aCcsIHcpXG4gICAgLmF0dHIoJ2hlaWdodCcsIGgpXG59KVxuXG52YXIgY2lyY2xlX2hlYWRfc2VnbWVudF8wX3JhZGl1cyA9IDQwXG52YXIgY2lyY2xlX2hlYWRfc2VnbWVudF8xX3JhZGl1cyA9IDMwXG5cbnZhciBkMyA9IHdpbmRvdy5kM1xuXG52YXIgZGl2X2tyYWtlbiA9IGQzLnNlbGVjdCgnZGl2I2tyYWtlbicpXG52YXIgc3ZnID0gZGl2X2tyYWtlbi5hcHBlbmQoJ3N2ZycpXG4gIC5hdHRyKCd2aWV3Qm94JywgJzAgMCAnICsgdyArICcgJyArIGgpXG4gIC5hdHRyKCd3aWR0aCcsIHcpXG4gIC5hdHRyKCdoZWlnaHQnLCBoKVxuICAuYXR0cigncHJlc2VydmVBc3BlY3RSYXRpbycsICd4TWlkWU1pZCcpXG4gIC5zdHlsZSgnYmFja2dyb3VuZC1jb2xvcicsICdyZ2JhKDAsMCwwLDAuMyknKVxuXG52YXIgYXJtX21ha2VyID0gcmVxdWlyZSgnLi9jcmVhdGUvYXJtLmpzJylcbnZhciBhcm1zID0gW11cblxuZm9yICh2YXIgaSA9IDA7IGkgPCAxOyBpKyspIHtcbiAgYXJtcy5wdXNoKGFybV9tYWtlcih7XG4gICAgcGFyZW50OiBzdmcsXG4gICAgZGlzdGFuY2U6IDIsXG4gICAgY291bnQ6IDEwLFxuICAgIG5fYXJtczogOFxuICB9KSlcbn1cblxudmFyIGhlYWRfcG9zaXRpb24gPSB7XG4gIHg6IHcgKiAwLjUsXG4gIHk6IGggKiAwLjUsXG4gIHZ4OiBNYXRoLnJhbmRvbSgpIC0gMC41LFxuICB2eTogTWF0aC5yYW5kb20oKSAtIDAuNSxcbiAgbmV3X3Z4OiAwLFxuICBuZXdfdnk6IDAsXG4gIHI6IDUwLFxuICB0cmFuc2l0aW9uX3RyaWdnZXJlZDogZmFsc2Vcbn1cblxudmFyIGdfaGVhZCA9IHN2Zy5hcHBlbmQoJ2cnKS5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBoZWFkX3Bvc2l0aW9uLnggKyAnICcgKyBoZWFkX3Bvc2l0aW9uLnkgKyAnKScpXG5cbnZhciBzY2FsZV9rcmFrZW5faGVhZCA9IDAuNFxudmFyIGdfa3Jha2VuX2hlYWQgPSBnX2hlYWQuYXBwZW5kKCdnJykuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgwIDApJylcbnZhciBnX2tyYWtlbl9oZWFkX3NjYWxlID0gZ19rcmFrZW5faGVhZC5hcHBlbmQoJ2cnKS5hdHRyKCd0cmFuc2Zvcm0nLCAnc2NhbGUoJyArIFtzY2FsZV9rcmFrZW5faGVhZCwgc2NhbGVfa3Jha2VuX2hlYWRdLmpvaW4oJyAnKSArICcpJylcblxuZ19rcmFrZW5faGVhZF9zY2FsZS5hcHBlbmQoJ3BhdGgnKS5hdHRyKCdkJywgJ00xNzIuNjUsMTMyLjM5cy0yMS44NS0yMi43Mi0zOS4zMi05LjYxYy0xNS45NCwxMiwwLDQwLjIsMCw0MC4yWicpLmF0dHIoJ2ZpbGwnLCAnYmxhY2snKS5hdHRyKCdzdHJva2UnLCAnbm9uZScpXG5nX2tyYWtlbl9oZWFkX3NjYWxlLmFwcGVuZCgncGF0aCcpLmF0dHIoJ2QnLCAnTTE0OC40NCwxNDEuNzJsLTIxLjM2LTkuMzNTMTEzLjM1LDE0MiwxMjEuMjIsMTQ5LDE0OC40NCwxNDEuNzIsMTQ4LjQ0LDE0MS43MlonKS5hdHRyKCdmaWxsJywgJ3doaXRlJykuYXR0cignc3Ryb2tlJywgJ25vbmUnKVxuZ19rcmFrZW5faGVhZF9zY2FsZS5hcHBlbmQoJ3BhdGgnKS5hdHRyKCdkJywgJ003Ni4xNCwxNzcuMzVjMTUuMTEtMTQsNTAuMTQtMjcuMzQsNjguNTUtMzguODUsMTQtOC43NCwzNS0xMy4xMSwzNS0xMy4xMXM2LjEyLTI1LjM0LDI2LjIxLTI3LjA5YzQxLjUtMy42MSw4Ni41OCwyOS4zNSw4Ni41OCwyOS4zNVMzNTQsMTE5LjgsMzk4LjYsMTQzLjM5czk5LjU0LDE0NS40LDIxLjU0LDIyMi4zNGMtNjcuMTksNjYuMjgtMTgwLTE4LjM4LTE4MC0xOC4zOHMtODQuMzcsMTUuMTEtMTI4Ljk0LTEyLjQyQzYyLjg4LDMwNS4xLDUxLjU1LDIwMC4xLDc2LjE0LDE3Ny4zNVonKS5hdHRyKCdmaWxsJywgJ2JsYWNrJykuYXR0cignc3Ryb2tlJywgJ25vbmUnKVxuZ19rcmFrZW5faGVhZF9zY2FsZS5hcHBlbmQoJ3BhdGgnKS5hdHRyKCdkJywgJ00xODguMTQsMTU4LjA1Yy0yLjY3LTkuMzksMy0xNi42MSwxMi0xOS40NSwxNi42LTUuMjQsNDAtMy43Niw0MC0zLjc2cy0xNy42OCwzMC43Ni0zMS42NiwzMC43NlMxOTAuOCwxNjcuNDQsMTg4LjE0LDE1OC4wNVonKS5hdHRyKCdmaWxsJywgJ3doaXRlJykuYXR0cignc3Ryb2tlJywgJ25vbmUnKVxuXG52YXIgY2lyY2xlX2hlYWQgPSBnX2hlYWQuYXBwZW5kKCdjaXJjbGUnKVxuICAuYXR0cignY3gnLCAwKVxuICAuYXR0cignZmlsbCcsICdub25lJylcbiAgLmF0dHIoJ2N5JywgMCkuYXR0cigncicsIGhlYWRfcG9zaXRpb24ucilcbiAgLmF0dHIoJ3N0cm9rZScsICdub25lJylcblxudmFyIGdfZXllX2wgPSBnX2hlYWQuYXBwZW5kKCdnJykuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgtMTUgLTEwKScpLmF0dHIoJ29wYWNpdHknLCAwKVxudmFyIGdfZXllX3IgPSBnX2hlYWQuYXBwZW5kKCdnJykuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgxNSAtMTApJykuYXR0cignb3BhY2l0eScsIDApXG52YXIgY2lyY2xlX2V5ZWJhY2tfbCA9IGdfZXllX2wuYXBwZW5kKCdjaXJjbGUnKS5hdHRyKCdjeCcsIDApLmF0dHIoJ2N5JywgMCkuYXR0cigncicsIDEwKS5hdHRyKCdmaWxsJywgJ3doaXRlJykuYXR0cigndHJhbnNmb3JtJywgJ3NjYWxlKDEuMCAwLjcpJylcbnZhciBjaXJjbGVfZXllYmFja19yID0gZ19leWVfci5hcHBlbmQoJ2NpcmNsZScpLmF0dHIoJ2N4JywgMCkuYXR0cignY3knLCAwKS5hdHRyKCdyJywgMTApLmF0dHIoJ2ZpbGwnLCAnd2hpdGUnKS5hdHRyKCd0cmFuc2Zvcm0nLCAnc2NhbGUoMS4wIDAuNyknKVxudmFyIGNpcmNsZV9leWViYWxsX2wgPSBnX2V5ZV9sLmFwcGVuZCgnY2lyY2xlJykuYXR0cignY3gnLCAwKS5hdHRyKCdjeScsIDApLmF0dHIoJ3InLCAyKS5hdHRyKCdmaWxsJywgJ3JnYmEoMCwwLDAsMC45KScpIC8vIC5hdHRyKCdzdHJva2UnLCAnZ3JlZW4nKS5hdHRyKCdzdHJva2Utd2lkdGgnLCAxLjUpXG52YXIgY2lyY2xlX2V5ZWJhbGxfciA9IGdfZXllX3IuYXBwZW5kKCdjaXJjbGUnKS5hdHRyKCdjeCcsIDApLmF0dHIoJ2N5JywgMCkuYXR0cigncicsIDIpLmF0dHIoJ2ZpbGwnLCAncmdiYSgwLDAsMCwwLjkpJykgLy8gLmF0dHIoJ3N0cm9rZScsICdncmVlbicpLmF0dHIoJ3N0cm9rZS13aWR0aCcsIDEuNSlcblxudmFyIGJsaW5rX3RpbWVvdXQsIGJsaW5rX3RpbWVvdXQyXG5mdW5jdGlvbiBibGluayAoKSB7XG4gIGNsZWFyVGltZW91dChibGlua190aW1lb3V0KVxuICBjbGVhclRpbWVvdXQoYmxpbmtfdGltZW91dDIpXG4gIHZhciBkdXJhdGlvbiA9IDIwXG4gIGNpcmNsZV9leWViYWNrX2wudHJhbnNpdGlvbigpLmF0dHIoJ3RyYW5zZm9ybScsICdzY2FsZSgxLjAgMC4xKScpLmVhc2UoZDMuZWFzZUxpbmVhcikuZHVyYXRpb24oZHVyYXRpb24pXG4gIGNpcmNsZV9leWViYWNrX3IudHJhbnNpdGlvbigpLmF0dHIoJ3RyYW5zZm9ybScsICdzY2FsZSgxLjAgMC4xKScpLmVhc2UoZDMuZWFzZUxpbmVhcikuZHVyYXRpb24oZHVyYXRpb24pXG4gIGJsaW5rX3RpbWVvdXQyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgY2xlYXJUaW1lb3V0KGJsaW5rX3RpbWVvdXQpXG4gICAgY2lyY2xlX2V5ZWJhY2tfbC50cmFuc2l0aW9uKCkuYXR0cigndHJhbnNmb3JtJywgJ3NjYWxlKDEuMCAwLjcpJykuZWFzZShkMy5lYXNlTGluZWFyKVxuICAgIGNpcmNsZV9leWViYWNrX3IudHJhbnNpdGlvbigpLmF0dHIoJ3RyYW5zZm9ybScsICdzY2FsZSgxLjAgMC43KScpLmVhc2UoZDMuZWFzZUxpbmVhcilcbiAgICBibGlua190aW1lb3V0ID0gc2V0VGltZW91dChibGluaywgKE1hdGgucmFuZG9tKCkgKiA1MDAwKSlcbiAgfSwgZHVyYXRpb24pXG59XG5ibGluaygpXG5cbnZhciB0aWNrID0gZnVuY3Rpb24gKCkge1xuICBoZWFkX3Bvc2l0aW9uLnggKz0gaGVhZF9wb3NpdGlvbi52eFxuICBoZWFkX3Bvc2l0aW9uLnkgKz0gaGVhZF9wb3NpdGlvbi52eVxuXG4gIHZhciBzY2FsZV94ID0gc2NhbGVfa3Jha2VuX2hlYWRcbiAgdmFyIHNjYWxlX3kgPSBzY2FsZV9rcmFrZW5faGVhZFxuICBpZiAoaGVhZF9wb3NpdGlvbi52eCA8IDApIHtcbiAgICBnX2tyYWtlbl9oZWFkX3NjYWxlLmF0dHIoJ3RyYW5zZm9ybScsICdzY2FsZSgnICsgW3NjYWxlX3gsIHNjYWxlX3ldLmpvaW4oJyAnKSArICcpJylcbiAgICBnX2tyYWtlbl9oZWFkLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoLTEwMCAtMTIwKScpXG4gIH0gZWxzZSB7XG4gICAgZ19rcmFrZW5faGVhZF9zY2FsZS5hdHRyKCd0cmFuc2Zvcm0nLCAnc2NhbGUoJyArIFstc2NhbGVfeCwgc2NhbGVfeV0uam9pbignICcpICsgJyknKVxuICAgIGdfa3Jha2VuX2hlYWQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgxMDAgLTEyMCknKVxuICB9XG5cbiAgdmFyIHIgPSAyMFxuXG4gIHZhciBkaXJ0eV9mcm9tX3dhbGwgPSBmYWxzZVxuICBpZiAoaGVhZF9wb3NpdGlvbi54ID4gdykge1xuICAgIGRpcnR5X2Zyb21fd2FsbCA9IHRydWVcbiAgICBoZWFkX3Bvc2l0aW9uLnggLT0gKGhlYWRfcG9zaXRpb24ueCAtIHcpXG4gICAgaGVhZF9wb3NpdGlvbi52eCAqPSAtMVxuICB9XG4gIGlmIChoZWFkX3Bvc2l0aW9uLnggPCAwKSB7XG4gICAgZGlydHlfZnJvbV93YWxsID0gdHJ1ZVxuICAgIGhlYWRfcG9zaXRpb24ueCArPSAoLWhlYWRfcG9zaXRpb24ueClcbiAgICBoZWFkX3Bvc2l0aW9uLnZ4ICo9IC0xXG4gIH1cbiAgaWYgKGhlYWRfcG9zaXRpb24ueSA+IGgpIHtcbiAgICBkaXJ0eV9mcm9tX3dhbGwgPSB0cnVlXG4gICAgaGVhZF9wb3NpdGlvbi55IC09IChoZWFkX3Bvc2l0aW9uLnkgLSBoKVxuICAgIGhlYWRfcG9zaXRpb24udnkgKj0gLTFcbiAgfVxuICBpZiAoaGVhZF9wb3NpdGlvbi55IDwgMCkge1xuICAgIGRpcnR5X2Zyb21fd2FsbCA9IHRydWVcbiAgICBoZWFkX3Bvc2l0aW9uLnkgKz0gKC1oZWFkX3Bvc2l0aW9uLnkpXG4gICAgaGVhZF9wb3NpdGlvbi52eSAqPSAtMVxuICB9XG5cbiAgaWYgKGRpcnR5X2Zyb21fd2FsbCkge1xuICAgIGNpcmNsZV9leWViYWxsX2wudHJhbnNpdGlvbigpLmF0dHIoJ2N4JywgaGVhZF9wb3NpdGlvbi52eCkuYXR0cignY3knLCBoZWFkX3Bvc2l0aW9uLnZ5KVxuICAgIGNpcmNsZV9leWViYWxsX3IudHJhbnNpdGlvbigpLmF0dHIoJ2N4JywgaGVhZF9wb3NpdGlvbi52eCkuYXR0cignY3knLCBoZWFkX3Bvc2l0aW9uLnZ5KVxuICAgIGJsaW5rKClcbiAgfVxuXG4gIGdfaGVhZC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBoZWFkX3Bvc2l0aW9uLnggKyAnICcgKyBoZWFkX3Bvc2l0aW9uLnkgKyAnKScpXG5cbiAgdmFyIGhlYWRfZGFtcGVuaW5nID0gMC45OVxuICB2YXIgYWxwaGEgPSBoZWFkX3Bvc2l0aW9uLnZ4XG4gIGhlYWRfcG9zaXRpb24udnggKj0gaGVhZF9kYW1wZW5pbmdcbiAgaGVhZF9wb3NpdGlvbi52eSAqPSBoZWFkX2RhbXBlbmluZ1xuXG4gIC8vIG1vdmUgaGVhZCByYW5kb21seVxuICBpZiAoTWF0aC5hYnMoYWxwaGEgLSBoZWFkX3Bvc2l0aW9uLnZ4KSA8IDAuMDA1ICYmIGhlYWRfcG9zaXRpb24udHJhbnNpdGlvbl90cmlnZ2VyZWQgPT09IGZhbHNlKSB7XG4gICAgaGVhZF9wb3NpdGlvbi50cmFuc2l0aW9uX3RyaWdnZXJlZCA9IHRydWVcbiAgICB2YXIgZHVyYXRpb24gPSAoTWF0aC5yYW5kb20oKSAqIDEwMCkgKyAxXG5cbiAgICAvLyBkZXRlcm1pbmUgaG93IG11Y2ggdGhlIHNxdWlkIGlzIGdvaW5nIHRvIG1vdmVcbiAgICB2YXIgdiA9IGR1cmF0aW9uIC8gMTAuMFxuXG4gICAgLy8gY2lyY2xlX2hlYWRfc2VnbWVudF8wLnRyYW5zaXRpb24oKS5kdXJhdGlvbigyMDAwKS5hdHRyKCdyeCcsIE1hdGgucmFuZG9tKCkgKiAxMCArIGNpcmNsZV9oZWFkX3NlZ21lbnRfMF9yYWRpdXMpLmF0dHIoJ3J5JywgTWF0aC5yYW5kb20oKSAqIDEwICsgY2lyY2xlX2hlYWRfc2VnbWVudF8wX3JhZGl1cykuZWFzZShkMy5lYXNlQm91bmNlKVxuICAgIC8vIGNpcmNsZV9oZWFkX3NlZ21lbnRfMS50cmFuc2l0aW9uKCkuZHVyYXRpb24oMjAwMCkuYXR0cigncngnLCBNYXRoLnJhbmRvbSgpICogMjAgKyBjaXJjbGVfaGVhZF9zZWdtZW50XzFfcmFkaXVzKS5hdHRyKCdyeScsIE1hdGgucmFuZG9tKCkgKiAyMCArIGNpcmNsZV9oZWFkX3NlZ21lbnRfMV9yYWRpdXMpLmVhc2UoZDMuZWFzZUJvdW5jZSlcbiAgICAvLyBoZWFkX2xpZ2FtZW50cy5zaW11bGF0aW9uLmZvcmNlKCdsaW5rJykuc3RyZW5ndGgoMilcblxuICAgIC8vIHNldCBhIG5ldyB2ZWxvY2l0eSBiYXNlZCBvbiByYW5kb20gbnVtYmVyc1xuICAgIGhlYWRfcG9zaXRpb24ubmV3X3Z4ID0gaGVhZF9wb3NpdGlvbi52eCArIChNYXRoLnJhbmRvbSgpICogdikgLSAodiAqIDAuNSlcbiAgICBoZWFkX3Bvc2l0aW9uLm5ld192eSA9IGhlYWRfcG9zaXRpb24udnkgKyAoTWF0aC5yYW5kb20oKSAqIHYpIC0gKHYgKiAwLjUpXG5cbiAgICBoZWFkX3Bvc2l0aW9uLnZ4ICs9IC1oZWFkX3Bvc2l0aW9uLm5ld192eCAqIDAuMjVcbiAgICBoZWFkX3Bvc2l0aW9uLnZ5ICs9IC1oZWFkX3Bvc2l0aW9uLm5ld192eSAqIDAuMjVcblxuICAgIGNpcmNsZV9oZWFkLnRyYW5zaXRpb24oKVxuICAgICAgLmF0dHIoJ3InLCBoZWFkX3Bvc2l0aW9uLnIgLSAoZHVyYXRpb24gLyA1KSlcbiAgICAgIC5lYXNlKGQzLmVhc2VMaW5lYXIpXG4gICAgICAuZHVyYXRpb24oZHVyYXRpb24gKiAyKVxuXG4gICAgY2lyY2xlX2V5ZWJhY2tfbC50cmFuc2l0aW9uKCkuYXR0cigndHJhbnNmb3JtJywgJ3NjYWxlKDEuMCwgMC45KScpXG4gICAgY2lyY2xlX2V5ZWJhY2tfci50cmFuc2l0aW9uKCkuYXR0cigndHJhbnNmb3JtJywgJ3NjYWxlKDEuMCwgMC45KScpXG4gICAgY2lyY2xlX2V5ZWJhbGxfbC50cmFuc2l0aW9uKCkuYXR0cignY3gnLCBoZWFkX3Bvc2l0aW9uLm5ld192eCkuYXR0cignY3knLCBoZWFkX3Bvc2l0aW9uLm5ld192eSkuYXR0cigncicsIDMpLmF0dHIoJ2ZpbGwnLCAncmVkJykuZWFzZShkMy5lYXNlQm91bmNlKVxuICAgIGNpcmNsZV9leWViYWxsX3IudHJhbnNpdGlvbigpLmF0dHIoJ2N4JywgaGVhZF9wb3NpdGlvbi5uZXdfdngpLmF0dHIoJ2N5JywgaGVhZF9wb3NpdGlvbi5uZXdfdnkpLmF0dHIoJ3InLCAzKS5hdHRyKCdmaWxsJywgJ3JlZCcpLmVhc2UoZDMuZWFzZUJvdW5jZSlcblxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgaGVhZF9wb3NpdGlvbi50cmFuc2l0aW9uX3RyaWdnZXJlZCA9IGZhbHNlXG4gICAgICBjaXJjbGVfaGVhZC50cmFuc2l0aW9uKCkuYXR0cigncicsIGhlYWRfcG9zaXRpb24ucilcbiAgICAgICAgLmVhc2UoZDMuZWFzZUVsYXN0aWMpLmR1cmF0aW9uKDEwMDApXG4gICAgICAgIC5kZWxheShkdXJhdGlvbiAvIDIpXG5cbiAgICAgIGNpcmNsZV9leWViYWNrX2wudHJhbnNpdGlvbigpLmF0dHIoJ3RyYW5zZm9ybScsICdzY2FsZSgxLjAsIDAuNyknKVxuICAgICAgY2lyY2xlX2V5ZWJhY2tfci50cmFuc2l0aW9uKCkuYXR0cigndHJhbnNmb3JtJywgJ3NjYWxlKDEuMCwgMC43KScpXG4gICAgICBjaXJjbGVfZXllYmFsbF9sLnRyYW5zaXRpb24oKS5hdHRyKCdmaWxsJywgJ3JnYmEoMCwwLDAsMC45KScpLmF0dHIoJ3InLCAyKS5kdXJhdGlvbigxMDAwKS5lYXNlKGQzLmVhc2VFbGFzdGljKVxuICAgICAgY2lyY2xlX2V5ZWJhbGxfci50cmFuc2l0aW9uKCkuYXR0cignZmlsbCcsICdyZ2JhKDAsMCwwLDAuOSknKS5hdHRyKCdyJywgMikuZHVyYXRpb24oMTAwMCkuZWFzZShkMy5lYXNlRWxhc3RpYylcblxuICAgICAgaGVhZF9wb3NpdGlvbi52eCA9IGhlYWRfcG9zaXRpb24ubmV3X3Z4XG4gICAgICBoZWFkX3Bvc2l0aW9uLnZ5ID0gaGVhZF9wb3NpdGlvbi5uZXdfdnlcblxuICAgICAgLy9cbiAgICAgIGFybXMuZm9yRWFjaChmdW5jdGlvbiAoYXJtKSB7XG4gICAgICAgIGFybS5zaW11bGF0aW9uLmFscGhhKChNYXRoLnJhbmRvbSgpICogMC4zKSArIDAuMSlcbiAgICAgICAgYXJtLnNpbXVsYXRpb24ucmVzdGFydCgpXG4gICAgICB9KVxuICAgIH0sIGR1cmF0aW9uICogNSlcbiAgfVxuXG4gIC8vIGF0dHJhY3Qgbm9kZXNcbiAgLy8gYXJtcy5mb3JFYWNoKGZ1bmN0aW9uIChhcm0sIGlkeCkge1xuICAvLyAgIHZhciBub2RlcyA9IGFybS5zaW11bGF0aW9uLm5vZGVzKClcbiAgLy8gICB2YXIgdGFyZ2V0X3ggPSB3IC8gKGlkeCArIDEpXG4gIC8vICAgdmFyIHRhcmdldF95ID0gMTBcbiAgLy8gICB2YXIgYXJtX3RpcCA9IG5vZGVzW25vZGVzLmxlbmd0aCAtIDFdXG4gIC8vXG4gIC8vICAgdmFyIGRpc3RhbmNlX3ggPSB0YXJnZXRfeCAtIGFybV90aXAueFxuICAvLyAgIHZhciBkaXN0YW5jZV95ID0gdGFyZ2V0X3kgLSBhcm1fdGlwLnlcbiAgLy9cbiAgLy8gICBhcm1fdGlwLnggKz0gZGlzdGFuY2VfeCAvIDEwXG4gIC8vICAgYXJtX3RpcC55ICs9IGRpc3RhbmNlX3kgLyAxMFxuICAvLyB9KVxuXG4gIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGljaylcbn1cbnRpY2soKVxuXG5hcm1zLmZvckVhY2goZnVuY3Rpb24gKGFybSkge1xuICB2YXIgc2ltdWxhdGlvbiA9IGFybS5zaW11bGF0aW9uXG4gIHZhciBub2RlcyA9IHNpbXVsYXRpb24ubm9kZXMoKVxuICB2YXIgbGlua3MgPSBhcm0ubGlua3NcbiAgdmFyIGxpbmsgPSBhcm0ubGlua1xuICB2YXIgbm9kZSA9IGFybS5ub2RlXG4gIHZhciBkYXRhID0gYXJtLmRhdGFcbiAgdmFyIGNvdW50ID0gYXJtLmNvdW50XG5cbiAgc2ltdWxhdGlvbi5vbigndGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSArPSBhcm0uY291bnQpIHtcbiAgICAgIG5vZGVzW2ldLnggPSBoZWFkX3Bvc2l0aW9uLnhcbiAgICAgIG5vZGVzW2ldLnkgPSBoZWFkX3Bvc2l0aW9uLnlcbiAgICB9XG5cbiAgICBpZiAod2luZG93LnVzZV9wYXRoID09PSB0cnVlKSB7XG4gICAgICBkYXRhID0gW11cbiAgICAgIG5vZGVzLmZvckVhY2goZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgZGF0YS5wdXNoKHsgeDogbm9kZS54LCB5OiBub2RlLnkgfSlcbiAgICAgIH0pXG4gICAgICBhcm0ubGluay5kYXR1bShkYXRhKS50cmFuc2l0aW9uKClcbiAgICAgICAgLmF0dHIoJ2QnLCBhcm0ubGluZV9nZW5lcmF0b3IpXG4gICAgfSBlbHNlIHtcbiAgICAgIGFybS5saW5rLmF0dHIoJ3gxJywgZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQuc291cmNlLnggfSlcbiAgICAgICAgLmF0dHIoJ3kxJywgZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQuc291cmNlLnkgfSlcbiAgICAgICAgLmF0dHIoJ3gyJywgZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQudGFyZ2V0LnggfSlcbiAgICAgICAgLmF0dHIoJ3kyJywgZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQudGFyZ2V0LnkgfSlcbiAgICB9XG4gICAgbm9kZS5hdHRyKCd0cmFuc2Zvcm0nLCBmdW5jdGlvbiAoZCwgaSkge1xuICAgICAgcmV0dXJuICd0cmFuc2xhdGUoJyArIGQueCArICcgJyArIGQueSArICcpJ1xuICAgIH0pXG4gIH0pXG5cbiAgc2ltdWxhdGlvbi5vbignZW5kJywgZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUubG9nKCdlbmQnKVxuICAgIG5vZGVzLmZvckVhY2goZnVuY3Rpb24gKG5vZGUsIGlkeCkge1xuICAgICAgdmFyIHYgPSAzLjBcbiAgICAgIG5vZGUudnggKz0gKE1hdGgucmFuZG9tKCkgKiB2KSAtICh2ICogMC41KVxuICAgICAgbm9kZS52eSArPSAoTWF0aC5yYW5kb20oKSAqIHYpIC0gKHYgKiAwLjUpXG4gICAgfSlcbiAgICBzaW11bGF0aW9uLmFscGhhKChNYXRoLnJhbmRvbSgpICogMC4zKSArIDAuMSlcbiAgICBzaW11bGF0aW9uLnJlc3RhcnQoKVxuICB9KVxufSlcbiJdfQ==
