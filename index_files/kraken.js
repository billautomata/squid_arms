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
var timeout_kraken_head_turn

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

for (var i = 0; i < 2; i++) {
  arms.push(arm_maker({
    parent: svg,
    distance: 2,
    count: 10,
    n_arms: 4
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
var circle_eyeback_l = g_kraken_head_scale.append('path').attr('d', 'M148.44,141.72l-21.36-9.33S113.35,142,121.22,149,148.44,141.72,148.44,141.72Z').attr('fill', 'white').attr('stroke', 'none').attr('transform', 'scale(1.0 1.0)')
g_kraken_head_scale.append('path').attr('d', 'M76.14,177.35c15.11-14,50.14-27.34,68.55-38.85,14-8.74,35-13.11,35-13.11s6.12-25.34,26.21-27.09c41.5-3.61,86.58,29.35,86.58,29.35S354,119.8,398.6,143.39s99.54,145.4,21.54,222.34c-67.19,66.28-180-18.38-180-18.38s-84.37,15.11-128.94-12.42C62.88,305.1,51.55,200.1,76.14,177.35Z').attr('fill', 'black').attr('stroke', 'none')
var circle_eyeback_r = g_kraken_head_scale.append('path').attr('d', 'M188.14,158.05c-2.67-9.39,3-16.61,12-19.45,16.6-5.24,40-3.76,40-3.76s-17.68,30.76-31.66,30.76S190.8,167.44,188.14,158.05Z').attr('fill', 'white').attr('stroke', 'none')

// var circle_head = g_head.append('circle')
//   .attr('cx', 0)
//   .attr('fill', 'none')
//   .attr('cy', 0).attr('r', head_position.r)
//   .attr('stroke', 'none')
//
// var g_eye_l = g_head.append('g').attr('transform', 'translate(-15 -10)').attr('opacity', 0)
// var g_eye_r = g_head.append('g').attr('transform', 'translate(15 -10)').attr('opacity', 0)
// var circle_eyeback_l = g_eye_l.append('circle').attr('cx', 0).attr('cy', 0).attr('r', 10).attr('fill', 'white').attr('transform', 'scale(1.0 0.7)')
// var circle_eyeback_r = g_eye_r.append('circle').attr('cx', 0).attr('cy', 0).attr('r', 10).attr('fill', 'white').attr('transform', 'scale(1.0 0.7)')
// var circle_eyeball_l = g_eye_l.append('circle').attr('cx', 0).attr('cy', 0).attr('r', 2).attr('fill', 'rgba(0,0,0,0.9)') // .attr('stroke', 'green').attr('stroke-width', 1.5)
// var circle_eyeball_r = g_eye_r.append('circle').attr('cx', 0).attr('cy', 0).attr('r', 2).attr('fill', 'rgba(0,0,0,0.9)') // .attr('stroke', 'green').attr('stroke-width', 1.5)

var blink_timeout, blink_timeout2
function blink () {
  clearTimeout(blink_timeout)
  clearTimeout(blink_timeout2)
  var duration = 200
  console.log('here')
  circle_eyeback_l.transition().attr('transform', 'translate(0 130) scale(1.0 0.1)').ease(d3.easeLinear).duration(duration)
  circle_eyeback_r.transition().attr('transform', 'translate(0 130) scale(1.0 0.1)').ease(d3.easeLinear).duration(duration)
  blink_timeout2 = setTimeout(function () {
    clearTimeout(blink_timeout)
    circle_eyeback_l.transition().duration(duration * 2).attr('transform', 'translate(0 0) scale(1.0 1.0)').ease(d3.easeLinear)
    circle_eyeback_r.transition().duration(duration * 2).attr('transform', 'translate(0 0) scale(1.0 1.0)').ease(d3.easeLinear)
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
    // circle_eyeball_l.transition().attr('cx', head_position.vx).attr('cy', head_position.vy)
    // circle_eyeball_r.transition().attr('cx', head_position.vx).attr('cy', head_position.vy)
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

    // circle_head.transition()
    //   .attr('r', head_position.r - (duration / 5))
    //   .ease(d3.easeLinear)
    //   .duration(duration * 2)

    // circle_eyeback_l.transition().attr('transform', 'scale(1.0, 0.9)')
    // circle_eyeback_r.transition().attr('transform', 'scale(1.0, 0.9)')
    // circle_eyeball_l.transition().attr('cx', head_position.new_vx).attr('cy', head_position.new_vy).attr('r', 3).attr('fill', 'red').ease(d3.easeBounce)
    // circle_eyeball_r.transition().attr('cx', head_position.new_vx).attr('cy', head_position.new_vy).attr('r', 3).attr('fill', 'red').ease(d3.easeBounce)

    setTimeout(function () {
      head_position.transition_triggered = false
      // circle_head.transition().attr('r', head_position.r)
      //   .ease(d3.easeElastic).duration(1000)
      //   .delay(duration / 2)

      // circle_eyeback_l.transition().attr('transform', 'scale(1.0, 0.7)')
      // circle_eyeback_r.transition().attr('transform', 'scale(1.0, 0.7)')
      // circle_eyeball_l.transition().attr('fill', 'rgba(0,0,0,0.9)').attr('r', 2).duration(1000).ease(d3.easeElastic)
      // circle_eyeball_r.transition().attr('fill', 'rgba(0,0,0,0.9)').attr('r', 2).duration(1000).ease(d3.easeElastic)

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJrcmFrZW4vY3JlYXRlL2FybS5qcyIsImtyYWtlbi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBhcm0gKG9wdGlvbnMpIHtcbiAgdmFyIG5vZGVzID0gW11cbiAgdmFyIGxpbmtzID0gW11cbiAgdmFyIG5fYXJtcyA9IG9wdGlvbnMubl9hcm1zXG4gIHZhciBjb3VudCA9IG9wdGlvbnMuY291bnRcblxuICB2YXIgbl9zZWdtZW50cyA9IG5fYXJtcyAqIGNvdW50XG5cbiAgY29uc29sZS5sb2coJ25fYXJtcycsIG5fYXJtcylcbiAgY29uc29sZS5sb2coJ3NlZ21lbnRzX3Blcl9hcm0nLCBjb3VudClcbiAgY29uc29sZS5sb2coJ3RvdGFsX3NlZ21lbnRzJywgbl9zZWdtZW50cylcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IG5fc2VnbWVudHM7IGkrKykge1xuICAgIG5vZGVzLnB1c2goe1xuICAgICAgbmFtZTogaSxcbiAgICAgIHR5cGU6ICduYScsXG4gICAgICBkb19saW5rOiAoaSA8IChuX3NlZ21lbnRzIC0gMSkpXG4gICAgICAgICYmICgoaSAlIGNvdW50KSAhPT0gKGNvdW50IC0gMSkpXG4gICAgICAgICYmIGkgPj0gMFxuICAgIH0pXG4gICAgLy8gY29uc29sZS5sb2coaSwgaSAlIGNvdW50LCAoXG4gICAgLy8gICAoaSA8IChuX3NlZ21lbnRzIC0gMSkpXG4gICAgLy8gICAmJiAoKGkgJSBjb3VudCkgIT09IChjb3VudCAtIDEpKVxuICAgIC8vICAgJiYgaSA+PSAwXG4gICAgLy8gICApKVxuICAgIGlmICgoaSA8IChuX3NlZ21lbnRzIC0gMSkpXG4gICAgICAmJiAoKGkgJSBjb3VudCkgIT09IChjb3VudCAtIDEpKVxuICAgICAgJiYgaSA+PSAwXG4gICAgKSB7XG4gICAgICBsaW5rcy5wdXNoKHtcbiAgICAgICAgc291cmNlOiBpLFxuICAgICAgICB0YXJnZXQ6IGkgKyAxLFxuICAgICAgICB2YWx1ZTogaSAlIGNvdW50XG4gICAgICB9KVxuICAgIH1cbiAgfVxuICB2YXIgZDMgPSB3aW5kb3cuZDNcblxuICB2YXIgc2ltdWxhdGlvbiA9IGQzLmZvcmNlU2ltdWxhdGlvbigpXG4gICAgLnZlbG9jaXR5RGVjYXkoMC4wMSlcbiAgICAuZm9yY2UoJ2xpbmsnLCBkMy5mb3JjZUxpbmsoKS5pZChmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC5uYW1lIH0pXG4gICAgICAuZGlzdGFuY2UoZnVuY3Rpb24gKGQsIGkpIHsgcmV0dXJuIChjb3VudCAtIChpICUgY291bnQpICsgMSkgKiBvcHRpb25zLmRpc3RhbmNlIH0pXG4gIClcbiAgICAuZm9yY2UoJ21hbnknLCBkMy5mb3JjZU1hbnlCb2R5KCkuc3RyZW5ndGgoLTMpKVxuICAgIC8vIC5mb3JjZSgnY2VudGVyJywgZDMuZm9yY2VDZW50ZXIoKS54KDUwMCkueSgyNTApKVxuXG4gIHNpbXVsYXRpb24ubm9kZXMobm9kZXMpXG4gIHNpbXVsYXRpb24uZm9yY2UoJ2xpbmsnKS5saW5rcyhsaW5rcylcblxuICB3aW5kb3cucyA9IHNpbXVsYXRpb25cblxuICBub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uIChub2RlLCBpZHgpIHtcbiAgICB2YXIgYXYgPSAxMDBcbiAgICB2YXIgdiA9IDEuMFxuICAgIG5vZGUueCA9ICh3aW5kb3cuaW5uZXJXaWR0aCAqIDAuNSkgKyAoTWF0aC5yYW5kb20oKSAqIGF2KSAtIChhdiAqIDAuNSlcbiAgICBub2RlLnkgPSAod2luZG93LmlubmVySGVpZ2h0ICogMC41KSArIChNYXRoLnJhbmRvbSgpICogYXYpIC0gKGF2ICogMC41KVxuICAgIG5vZGUudnggKz0gKE1hdGgucmFuZG9tKCkgKiB2KSAtICh2ICogMC41KVxuICAgIG5vZGUudnkgKz0gKE1hdGgucmFuZG9tKCkgKiB2KSAtICh2ICogMC41KVxuICB9KVxuXG4gIHZhciBzdmcgPSBvcHRpb25zLnBhcmVudFxuXG4gIHZhciByYW5kb21fcmFuZ2VfZGlzdGFuY2UgPSAzMFxuICB2YXIgb2Zmc2V0X3ggPSAoTWF0aC5yYW5kb20oKSAqIHJhbmRvbV9yYW5nZV9kaXN0YW5jZSkgLSAocmFuZG9tX3JhbmdlX2Rpc3RhbmNlICogMC41KVxuICB2YXIgb2Zmc2V0X3kgPSAoTWF0aC5yYW5kb20oKSAqIHJhbmRvbV9yYW5nZV9kaXN0YW5jZSkgLSAocmFuZG9tX3JhbmdlX2Rpc3RhbmNlICogMC41KVxuXG4gIHN2ZyA9IHN2Zy5hcHBlbmQoJ2cnKVxuICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBvZmZzZXRfeCArICcgJyArIG9mZnNldF95ICsgJyknKVxuXG4gIHZhciBsaW5lX2dlbmVyYXRvciA9IGQzLmxpbmUoKVxuICAgIC54KGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLnggfSlcbiAgICAueShmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC55IH0pXG4gICAgLmN1cnZlKGQzLmN1cnZlQ2F0bXVsbFJvbS5hbHBoYSgxLjApKVxuXG4gIHZhciBkYXRhID0gW11cblxuICBpZiAod2luZG93LnVzZV9wYXRoID09PSB0cnVlKSB7XG4gICAgbm9kZXMuZm9yRWFjaChmdW5jdGlvbiAobm9kZSkge1xuICAgICAgZGF0YS5wdXNoKHsgeDogbm9kZS54LCB5OiBub2RlLnkgfSlcbiAgICB9KVxuXG4gICAgdmFyIGxpbmsgPSBzdmcuYXBwZW5kKCdwYXRoJylcbiAgICAgIC5kYXR1bShkYXRhKVxuICAgICAgLmF0dHIoJ2QnLCBsaW5lX2dlbmVyYXRvcilcbiAgICAgIC5hdHRyKCdjbGFzcycsICdsaW5rJylcbiAgICAgIC5hdHRyKCdzdHJva2UnLCAnYmxhY2snKVxuICAgICAgLmF0dHIoJ2ZpbGwnLCAnbm9uZScpXG4gICAgICAuYXR0cignc3Ryb2tlLWxpbmVjYXAnLCAncm91bmQnKVxuICAgICAgLnN0eWxlKCdzdHJva2Utb3BhY2l0eScsIDEuMClcbiAgICAgIC5zdHlsZSgnc3Ryb2tlLXdpZHRoJywgMylcbiAgfSBlbHNlIHtcbiAgICB2YXIgbGluayA9IHN2Zy5zZWxlY3RBbGwoJy5saW5rJylcbiAgICAgIC5kYXRhKGxpbmtzKVxuICAgICAgLmVudGVyKCkuYXBwZW5kKCdsaW5lJylcbiAgICAgIC5hdHRyKCdjbGFzcycsICdsaW5rJylcbiAgICAgIC5hdHRyKCdzdHJva2UnLCAnYmxhY2snKVxuICAgICAgLmF0dHIoJ2ZpbGwnLCAnbm9uZScpXG4gICAgICAuYXR0cignc3Ryb2tlLWxpbmVjYXAnLCAncm91bmQnKVxuICAgICAgLnN0eWxlKCdzdHJva2Utb3BhY2l0eScsIDEuMClcbiAgICAgIC5zdHlsZSgnc3Ryb2tlLXdpZHRoJywgZnVuY3Rpb24gKGQsIGkpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coZC52YWx1ZSwgaSwgY291bnQgLSBkLnZhbHVlKVxuICAgICAgICByZXR1cm4gKGNvdW50IC0gZC52YWx1ZSkgKiAzXG4gICAgICB9KVxuICB9XG5cbiAgdmFyIG5vZGUgPSBzdmcuc2VsZWN0QWxsKCcubm9kZScpXG4gICAgLmRhdGEobm9kZXMpXG4gICAgLmVudGVyKCkuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnbm9kZScpXG5cbiAgcmV0dXJuIHtcbiAgICBzaW11bGF0aW9uOiBzaW11bGF0aW9uLFxuICAgIGxpbms6IGxpbmssXG4gICAgbGlua3M6IGxpbmtzLFxuICAgIG5vZGU6IG5vZGUsXG4gICAgbGluZV9nZW5lcmF0b3I6IGxpbmVfZ2VuZXJhdG9yLFxuICAgIGRhdGE6IGRhdGEsXG4gICAgY291bnQ6IGNvdW50LFxuICAgIG5fYXJtczogbl9hcm1zXG4gIH1cbn1cbiIsImNvbnNvbGUubG9nKCdoZWxsbyBmcm9tIHRoZSBrcmFrZW4hJylcblxuY29uc29sZS5sb2coJ2xvbCcpXG5cbnZhciB3ID0gd2luZG93LmlubmVyV2lkdGhcbnZhciBoID0gd2luZG93LmlubmVySGVpZ2h0XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XG4gIGNvbnNvbGUubG9nKCdyZXNpemUnKVxuXG4gIHcgPSB3aW5kb3cuaW5uZXJXaWR0aFxuICBoID0gd2luZG93LmlubmVySGVpZ2h0XG5cbiAgc3ZnLmF0dHIoJ3ZpZXdCb3gnLCAnMCAwICcgKyB3ICsgJyAnICsgaClcbiAgICAuYXR0cignd2lkdGgnLCB3KVxuICAgIC5hdHRyKCdoZWlnaHQnLCBoKVxufSlcblxudmFyIGNpcmNsZV9oZWFkX3NlZ21lbnRfMF9yYWRpdXMgPSA0MFxudmFyIGNpcmNsZV9oZWFkX3NlZ21lbnRfMV9yYWRpdXMgPSAzMFxudmFyIHRpbWVvdXRfa3Jha2VuX2hlYWRfdHVyblxuXG52YXIgZDMgPSB3aW5kb3cuZDNcblxudmFyIGRpdl9rcmFrZW4gPSBkMy5zZWxlY3QoJ2RpdiNrcmFrZW4nKVxudmFyIHN2ZyA9IGRpdl9rcmFrZW4uYXBwZW5kKCdzdmcnKVxuICAuYXR0cigndmlld0JveCcsICcwIDAgJyArIHcgKyAnICcgKyBoKVxuICAuYXR0cignd2lkdGgnLCB3KVxuICAuYXR0cignaGVpZ2h0JywgaClcbiAgLmF0dHIoJ3ByZXNlcnZlQXNwZWN0UmF0aW8nLCAneE1pZFlNaWQnKVxuICAuc3R5bGUoJ2JhY2tncm91bmQtY29sb3InLCAncmdiYSgwLDAsMCwwLjMpJylcblxudmFyIGFybV9tYWtlciA9IHJlcXVpcmUoJy4vY3JlYXRlL2FybS5qcycpXG52YXIgYXJtcyA9IFtdXG5cbmZvciAodmFyIGkgPSAwOyBpIDwgMjsgaSsrKSB7XG4gIGFybXMucHVzaChhcm1fbWFrZXIoe1xuICAgIHBhcmVudDogc3ZnLFxuICAgIGRpc3RhbmNlOiAyLFxuICAgIGNvdW50OiAxMCxcbiAgICBuX2FybXM6IDRcbiAgfSkpXG59XG5cbnZhciBoZWFkX3Bvc2l0aW9uID0ge1xuICB4OiB3ICogMC41LFxuICB5OiBoICogMC41LFxuICB2eDogTWF0aC5yYW5kb20oKSAtIDAuNSxcbiAgdnk6IE1hdGgucmFuZG9tKCkgLSAwLjUsXG4gIG5ld192eDogMCxcbiAgbmV3X3Z5OiAwLFxuICByOiA1MCxcbiAgdHJhbnNpdGlvbl90cmlnZ2VyZWQ6IGZhbHNlXG59XG5cbnZhciBnX2hlYWQgPSBzdmcuYXBwZW5kKCdnJykuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgaGVhZF9wb3NpdGlvbi54ICsgJyAnICsgaGVhZF9wb3NpdGlvbi55ICsgJyknKVxuXG52YXIgc2NhbGVfa3Jha2VuX2hlYWQgPSAwLjRcbnZhciBnX2tyYWtlbl9oZWFkID0gZ19oZWFkLmFwcGVuZCgnZycpLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoMCAwKScpXG52YXIgZ19rcmFrZW5faGVhZF9zY2FsZSA9IGdfa3Jha2VuX2hlYWQuYXBwZW5kKCdnJykuYXR0cigndHJhbnNmb3JtJywgJ3NjYWxlKCcgKyBbc2NhbGVfa3Jha2VuX2hlYWQsIHNjYWxlX2tyYWtlbl9oZWFkXS5qb2luKCcgJykgKyAnKScpXG5cbmdfa3Jha2VuX2hlYWRfc2NhbGUuYXBwZW5kKCdwYXRoJykuYXR0cignZCcsICdNMTcyLjY1LDEzMi4zOXMtMjEuODUtMjIuNzItMzkuMzItOS42MWMtMTUuOTQsMTIsMCw0MC4yLDAsNDAuMlonKS5hdHRyKCdmaWxsJywgJ2JsYWNrJykuYXR0cignc3Ryb2tlJywgJ25vbmUnKVxudmFyIGNpcmNsZV9leWViYWNrX2wgPSBnX2tyYWtlbl9oZWFkX3NjYWxlLmFwcGVuZCgncGF0aCcpLmF0dHIoJ2QnLCAnTTE0OC40NCwxNDEuNzJsLTIxLjM2LTkuMzNTMTEzLjM1LDE0MiwxMjEuMjIsMTQ5LDE0OC40NCwxNDEuNzIsMTQ4LjQ0LDE0MS43MlonKS5hdHRyKCdmaWxsJywgJ3doaXRlJykuYXR0cignc3Ryb2tlJywgJ25vbmUnKS5hdHRyKCd0cmFuc2Zvcm0nLCAnc2NhbGUoMS4wIDEuMCknKVxuZ19rcmFrZW5faGVhZF9zY2FsZS5hcHBlbmQoJ3BhdGgnKS5hdHRyKCdkJywgJ003Ni4xNCwxNzcuMzVjMTUuMTEtMTQsNTAuMTQtMjcuMzQsNjguNTUtMzguODUsMTQtOC43NCwzNS0xMy4xMSwzNS0xMy4xMXM2LjEyLTI1LjM0LDI2LjIxLTI3LjA5YzQxLjUtMy42MSw4Ni41OCwyOS4zNSw4Ni41OCwyOS4zNVMzNTQsMTE5LjgsMzk4LjYsMTQzLjM5czk5LjU0LDE0NS40LDIxLjU0LDIyMi4zNGMtNjcuMTksNjYuMjgtMTgwLTE4LjM4LTE4MC0xOC4zOHMtODQuMzcsMTUuMTEtMTI4Ljk0LTEyLjQyQzYyLjg4LDMwNS4xLDUxLjU1LDIwMC4xLDc2LjE0LDE3Ny4zNVonKS5hdHRyKCdmaWxsJywgJ2JsYWNrJykuYXR0cignc3Ryb2tlJywgJ25vbmUnKVxudmFyIGNpcmNsZV9leWViYWNrX3IgPSBnX2tyYWtlbl9oZWFkX3NjYWxlLmFwcGVuZCgncGF0aCcpLmF0dHIoJ2QnLCAnTTE4OC4xNCwxNTguMDVjLTIuNjctOS4zOSwzLTE2LjYxLDEyLTE5LjQ1LDE2LjYtNS4yNCw0MC0zLjc2LDQwLTMuNzZzLTE3LjY4LDMwLjc2LTMxLjY2LDMwLjc2UzE5MC44LDE2Ny40NCwxODguMTQsMTU4LjA1WicpLmF0dHIoJ2ZpbGwnLCAnd2hpdGUnKS5hdHRyKCdzdHJva2UnLCAnbm9uZScpXG5cbi8vIHZhciBjaXJjbGVfaGVhZCA9IGdfaGVhZC5hcHBlbmQoJ2NpcmNsZScpXG4vLyAgIC5hdHRyKCdjeCcsIDApXG4vLyAgIC5hdHRyKCdmaWxsJywgJ25vbmUnKVxuLy8gICAuYXR0cignY3knLCAwKS5hdHRyKCdyJywgaGVhZF9wb3NpdGlvbi5yKVxuLy8gICAuYXR0cignc3Ryb2tlJywgJ25vbmUnKVxuLy9cbi8vIHZhciBnX2V5ZV9sID0gZ19oZWFkLmFwcGVuZCgnZycpLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoLTE1IC0xMCknKS5hdHRyKCdvcGFjaXR5JywgMClcbi8vIHZhciBnX2V5ZV9yID0gZ19oZWFkLmFwcGVuZCgnZycpLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoMTUgLTEwKScpLmF0dHIoJ29wYWNpdHknLCAwKVxuLy8gdmFyIGNpcmNsZV9leWViYWNrX2wgPSBnX2V5ZV9sLmFwcGVuZCgnY2lyY2xlJykuYXR0cignY3gnLCAwKS5hdHRyKCdjeScsIDApLmF0dHIoJ3InLCAxMCkuYXR0cignZmlsbCcsICd3aGl0ZScpLmF0dHIoJ3RyYW5zZm9ybScsICdzY2FsZSgxLjAgMC43KScpXG4vLyB2YXIgY2lyY2xlX2V5ZWJhY2tfciA9IGdfZXllX3IuYXBwZW5kKCdjaXJjbGUnKS5hdHRyKCdjeCcsIDApLmF0dHIoJ2N5JywgMCkuYXR0cigncicsIDEwKS5hdHRyKCdmaWxsJywgJ3doaXRlJykuYXR0cigndHJhbnNmb3JtJywgJ3NjYWxlKDEuMCAwLjcpJylcbi8vIHZhciBjaXJjbGVfZXllYmFsbF9sID0gZ19leWVfbC5hcHBlbmQoJ2NpcmNsZScpLmF0dHIoJ2N4JywgMCkuYXR0cignY3knLCAwKS5hdHRyKCdyJywgMikuYXR0cignZmlsbCcsICdyZ2JhKDAsMCwwLDAuOSknKSAvLyAuYXR0cignc3Ryb2tlJywgJ2dyZWVuJykuYXR0cignc3Ryb2tlLXdpZHRoJywgMS41KVxuLy8gdmFyIGNpcmNsZV9leWViYWxsX3IgPSBnX2V5ZV9yLmFwcGVuZCgnY2lyY2xlJykuYXR0cignY3gnLCAwKS5hdHRyKCdjeScsIDApLmF0dHIoJ3InLCAyKS5hdHRyKCdmaWxsJywgJ3JnYmEoMCwwLDAsMC45KScpIC8vIC5hdHRyKCdzdHJva2UnLCAnZ3JlZW4nKS5hdHRyKCdzdHJva2Utd2lkdGgnLCAxLjUpXG5cbnZhciBibGlua190aW1lb3V0LCBibGlua190aW1lb3V0MlxuZnVuY3Rpb24gYmxpbmsgKCkge1xuICBjbGVhclRpbWVvdXQoYmxpbmtfdGltZW91dClcbiAgY2xlYXJUaW1lb3V0KGJsaW5rX3RpbWVvdXQyKVxuICB2YXIgZHVyYXRpb24gPSAyMDBcbiAgY29uc29sZS5sb2coJ2hlcmUnKVxuICBjaXJjbGVfZXllYmFja19sLnRyYW5zaXRpb24oKS5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKDAgMTMwKSBzY2FsZSgxLjAgMC4xKScpLmVhc2UoZDMuZWFzZUxpbmVhcikuZHVyYXRpb24oZHVyYXRpb24pXG4gIGNpcmNsZV9leWViYWNrX3IudHJhbnNpdGlvbigpLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoMCAxMzApIHNjYWxlKDEuMCAwLjEpJykuZWFzZShkMy5lYXNlTGluZWFyKS5kdXJhdGlvbihkdXJhdGlvbilcbiAgYmxpbmtfdGltZW91dDIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICBjbGVhclRpbWVvdXQoYmxpbmtfdGltZW91dClcbiAgICBjaXJjbGVfZXllYmFja19sLnRyYW5zaXRpb24oKS5kdXJhdGlvbihkdXJhdGlvbiAqIDIpLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoMCAwKSBzY2FsZSgxLjAgMS4wKScpLmVhc2UoZDMuZWFzZUxpbmVhcilcbiAgICBjaXJjbGVfZXllYmFja19yLnRyYW5zaXRpb24oKS5kdXJhdGlvbihkdXJhdGlvbiAqIDIpLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoMCAwKSBzY2FsZSgxLjAgMS4wKScpLmVhc2UoZDMuZWFzZUxpbmVhcilcbiAgICBibGlua190aW1lb3V0ID0gc2V0VGltZW91dChibGluaywgKE1hdGgucmFuZG9tKCkgKiA1MDAwKSlcbiAgfSwgZHVyYXRpb24pXG59XG5ibGluaygpXG5cbnZhciB0aWNrID0gZnVuY3Rpb24gKCkge1xuICBoZWFkX3Bvc2l0aW9uLnggKz0gaGVhZF9wb3NpdGlvbi52eFxuICBoZWFkX3Bvc2l0aW9uLnkgKz0gaGVhZF9wb3NpdGlvbi52eVxuXG4gIHZhciBzY2FsZV94ID0gc2NhbGVfa3Jha2VuX2hlYWRcbiAgdmFyIHNjYWxlX3kgPSBzY2FsZV9rcmFrZW5faGVhZFxuXG4gIGlmIChoZWFkX3Bvc2l0aW9uLnZ4IDwgMCkge1xuICAgIGdfa3Jha2VuX2hlYWRfc2NhbGUuYXR0cigndHJhbnNmb3JtJywgJ3NjYWxlKCcgKyBbc2NhbGVfeCwgc2NhbGVfeV0uam9pbignICcpICsgJyknKVxuICAgIGdfa3Jha2VuX2hlYWQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgtMTAwIC0xMjApJylcblxuICB9IGVsc2Uge1xuICAgIGdfa3Jha2VuX2hlYWRfc2NhbGUuYXR0cigndHJhbnNmb3JtJywgJ3NjYWxlKCcgKyBbLXNjYWxlX3gsIHNjYWxlX3ldLmpvaW4oJyAnKSArICcpJylcbiAgICBnX2tyYWtlbl9oZWFkLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoMTAwIC0xMjApJylcbiAgfVxuXG4gIHZhciByID0gMjBcblxuICB2YXIgZGlydHlfZnJvbV93YWxsID0gZmFsc2VcbiAgaWYgKGhlYWRfcG9zaXRpb24ueCA+IHcpIHtcbiAgICBkaXJ0eV9mcm9tX3dhbGwgPSB0cnVlXG4gICAgaGVhZF9wb3NpdGlvbi54IC09IChoZWFkX3Bvc2l0aW9uLnggLSB3KVxuICAgIGhlYWRfcG9zaXRpb24udnggKj0gLTFcbiAgfVxuICBpZiAoaGVhZF9wb3NpdGlvbi54IDwgMCkge1xuICAgIGRpcnR5X2Zyb21fd2FsbCA9IHRydWVcbiAgICBoZWFkX3Bvc2l0aW9uLnggKz0gKC1oZWFkX3Bvc2l0aW9uLngpXG4gICAgaGVhZF9wb3NpdGlvbi52eCAqPSAtMVxuICB9XG4gIGlmIChoZWFkX3Bvc2l0aW9uLnkgPiBoKSB7XG4gICAgZGlydHlfZnJvbV93YWxsID0gdHJ1ZVxuICAgIGhlYWRfcG9zaXRpb24ueSAtPSAoaGVhZF9wb3NpdGlvbi55IC0gaClcbiAgICBoZWFkX3Bvc2l0aW9uLnZ5ICo9IC0xXG4gIH1cbiAgaWYgKGhlYWRfcG9zaXRpb24ueSA8IDApIHtcbiAgICBkaXJ0eV9mcm9tX3dhbGwgPSB0cnVlXG4gICAgaGVhZF9wb3NpdGlvbi55ICs9ICgtaGVhZF9wb3NpdGlvbi55KVxuICAgIGhlYWRfcG9zaXRpb24udnkgKj0gLTFcbiAgfVxuXG4gIGlmIChkaXJ0eV9mcm9tX3dhbGwpIHtcbiAgICAvLyBjaXJjbGVfZXllYmFsbF9sLnRyYW5zaXRpb24oKS5hdHRyKCdjeCcsIGhlYWRfcG9zaXRpb24udngpLmF0dHIoJ2N5JywgaGVhZF9wb3NpdGlvbi52eSlcbiAgICAvLyBjaXJjbGVfZXllYmFsbF9yLnRyYW5zaXRpb24oKS5hdHRyKCdjeCcsIGhlYWRfcG9zaXRpb24udngpLmF0dHIoJ2N5JywgaGVhZF9wb3NpdGlvbi52eSlcbiAgICBibGluaygpXG4gIH1cblxuICBnX2hlYWQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgaGVhZF9wb3NpdGlvbi54ICsgJyAnICsgaGVhZF9wb3NpdGlvbi55ICsgJyknKVxuXG4gIHZhciBoZWFkX2RhbXBlbmluZyA9IDAuOTlcbiAgdmFyIGFscGhhID0gaGVhZF9wb3NpdGlvbi52eFxuICBoZWFkX3Bvc2l0aW9uLnZ4ICo9IGhlYWRfZGFtcGVuaW5nXG4gIGhlYWRfcG9zaXRpb24udnkgKj0gaGVhZF9kYW1wZW5pbmdcblxuICAvLyBtb3ZlIGhlYWQgcmFuZG9tbHlcbiAgaWYgKE1hdGguYWJzKGFscGhhIC0gaGVhZF9wb3NpdGlvbi52eCkgPCAwLjAwNSAmJiBoZWFkX3Bvc2l0aW9uLnRyYW5zaXRpb25fdHJpZ2dlcmVkID09PSBmYWxzZSkge1xuICAgIGhlYWRfcG9zaXRpb24udHJhbnNpdGlvbl90cmlnZ2VyZWQgPSB0cnVlXG4gICAgdmFyIGR1cmF0aW9uID0gKE1hdGgucmFuZG9tKCkgKiAxMDApICsgMVxuXG4gICAgLy8gZGV0ZXJtaW5lIGhvdyBtdWNoIHRoZSBzcXVpZCBpcyBnb2luZyB0byBtb3ZlXG4gICAgdmFyIHYgPSBkdXJhdGlvbiAvIDEwLjBcblxuICAgIC8vIGNpcmNsZV9oZWFkX3NlZ21lbnRfMC50cmFuc2l0aW9uKCkuZHVyYXRpb24oMjAwMCkuYXR0cigncngnLCBNYXRoLnJhbmRvbSgpICogMTAgKyBjaXJjbGVfaGVhZF9zZWdtZW50XzBfcmFkaXVzKS5hdHRyKCdyeScsIE1hdGgucmFuZG9tKCkgKiAxMCArIGNpcmNsZV9oZWFkX3NlZ21lbnRfMF9yYWRpdXMpLmVhc2UoZDMuZWFzZUJvdW5jZSlcbiAgICAvLyBjaXJjbGVfaGVhZF9zZWdtZW50XzEudHJhbnNpdGlvbigpLmR1cmF0aW9uKDIwMDApLmF0dHIoJ3J4JywgTWF0aC5yYW5kb20oKSAqIDIwICsgY2lyY2xlX2hlYWRfc2VnbWVudF8xX3JhZGl1cykuYXR0cigncnknLCBNYXRoLnJhbmRvbSgpICogMjAgKyBjaXJjbGVfaGVhZF9zZWdtZW50XzFfcmFkaXVzKS5lYXNlKGQzLmVhc2VCb3VuY2UpXG4gICAgLy8gaGVhZF9saWdhbWVudHMuc2ltdWxhdGlvbi5mb3JjZSgnbGluaycpLnN0cmVuZ3RoKDIpXG5cbiAgICAvLyBzZXQgYSBuZXcgdmVsb2NpdHkgYmFzZWQgb24gcmFuZG9tIG51bWJlcnNcbiAgICBoZWFkX3Bvc2l0aW9uLm5ld192eCA9IGhlYWRfcG9zaXRpb24udnggKyAoTWF0aC5yYW5kb20oKSAqIHYpIC0gKHYgKiAwLjUpXG4gICAgaGVhZF9wb3NpdGlvbi5uZXdfdnkgPSBoZWFkX3Bvc2l0aW9uLnZ5ICsgKE1hdGgucmFuZG9tKCkgKiB2KSAtICh2ICogMC41KVxuXG4gICAgaGVhZF9wb3NpdGlvbi52eCArPSAtaGVhZF9wb3NpdGlvbi5uZXdfdnggKiAwLjI1XG4gICAgaGVhZF9wb3NpdGlvbi52eSArPSAtaGVhZF9wb3NpdGlvbi5uZXdfdnkgKiAwLjI1XG5cbiAgICAvLyBjaXJjbGVfaGVhZC50cmFuc2l0aW9uKClcbiAgICAvLyAgIC5hdHRyKCdyJywgaGVhZF9wb3NpdGlvbi5yIC0gKGR1cmF0aW9uIC8gNSkpXG4gICAgLy8gICAuZWFzZShkMy5lYXNlTGluZWFyKVxuICAgIC8vICAgLmR1cmF0aW9uKGR1cmF0aW9uICogMilcblxuICAgIC8vIGNpcmNsZV9leWViYWNrX2wudHJhbnNpdGlvbigpLmF0dHIoJ3RyYW5zZm9ybScsICdzY2FsZSgxLjAsIDAuOSknKVxuICAgIC8vIGNpcmNsZV9leWViYWNrX3IudHJhbnNpdGlvbigpLmF0dHIoJ3RyYW5zZm9ybScsICdzY2FsZSgxLjAsIDAuOSknKVxuICAgIC8vIGNpcmNsZV9leWViYWxsX2wudHJhbnNpdGlvbigpLmF0dHIoJ2N4JywgaGVhZF9wb3NpdGlvbi5uZXdfdngpLmF0dHIoJ2N5JywgaGVhZF9wb3NpdGlvbi5uZXdfdnkpLmF0dHIoJ3InLCAzKS5hdHRyKCdmaWxsJywgJ3JlZCcpLmVhc2UoZDMuZWFzZUJvdW5jZSlcbiAgICAvLyBjaXJjbGVfZXllYmFsbF9yLnRyYW5zaXRpb24oKS5hdHRyKCdjeCcsIGhlYWRfcG9zaXRpb24ubmV3X3Z4KS5hdHRyKCdjeScsIGhlYWRfcG9zaXRpb24ubmV3X3Z5KS5hdHRyKCdyJywgMykuYXR0cignZmlsbCcsICdyZWQnKS5lYXNlKGQzLmVhc2VCb3VuY2UpXG5cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGhlYWRfcG9zaXRpb24udHJhbnNpdGlvbl90cmlnZ2VyZWQgPSBmYWxzZVxuICAgICAgLy8gY2lyY2xlX2hlYWQudHJhbnNpdGlvbigpLmF0dHIoJ3InLCBoZWFkX3Bvc2l0aW9uLnIpXG4gICAgICAvLyAgIC5lYXNlKGQzLmVhc2VFbGFzdGljKS5kdXJhdGlvbigxMDAwKVxuICAgICAgLy8gICAuZGVsYXkoZHVyYXRpb24gLyAyKVxuXG4gICAgICAvLyBjaXJjbGVfZXllYmFja19sLnRyYW5zaXRpb24oKS5hdHRyKCd0cmFuc2Zvcm0nLCAnc2NhbGUoMS4wLCAwLjcpJylcbiAgICAgIC8vIGNpcmNsZV9leWViYWNrX3IudHJhbnNpdGlvbigpLmF0dHIoJ3RyYW5zZm9ybScsICdzY2FsZSgxLjAsIDAuNyknKVxuICAgICAgLy8gY2lyY2xlX2V5ZWJhbGxfbC50cmFuc2l0aW9uKCkuYXR0cignZmlsbCcsICdyZ2JhKDAsMCwwLDAuOSknKS5hdHRyKCdyJywgMikuZHVyYXRpb24oMTAwMCkuZWFzZShkMy5lYXNlRWxhc3RpYylcbiAgICAgIC8vIGNpcmNsZV9leWViYWxsX3IudHJhbnNpdGlvbigpLmF0dHIoJ2ZpbGwnLCAncmdiYSgwLDAsMCwwLjkpJykuYXR0cigncicsIDIpLmR1cmF0aW9uKDEwMDApLmVhc2UoZDMuZWFzZUVsYXN0aWMpXG5cbiAgICAgIGhlYWRfcG9zaXRpb24udnggPSBoZWFkX3Bvc2l0aW9uLm5ld192eFxuICAgICAgaGVhZF9wb3NpdGlvbi52eSA9IGhlYWRfcG9zaXRpb24ubmV3X3Z5XG5cbiAgICAgIC8vXG4gICAgICBhcm1zLmZvckVhY2goZnVuY3Rpb24gKGFybSkge1xuICAgICAgICBhcm0uc2ltdWxhdGlvbi5hbHBoYSgoTWF0aC5yYW5kb20oKSAqIDAuMykgKyAwLjEpXG4gICAgICAgIGFybS5zaW11bGF0aW9uLnJlc3RhcnQoKVxuICAgICAgfSlcbiAgICB9LCBkdXJhdGlvbiAqIDUpXG4gIH1cblxuICAvLyBhdHRyYWN0IG5vZGVzXG4gIC8vIGFybXMuZm9yRWFjaChmdW5jdGlvbiAoYXJtLCBpZHgpIHtcbiAgLy8gICB2YXIgbm9kZXMgPSBhcm0uc2ltdWxhdGlvbi5ub2RlcygpXG4gIC8vICAgdmFyIHRhcmdldF94ID0gdyAvIChpZHggKyAxKVxuICAvLyAgIHZhciB0YXJnZXRfeSA9IDEwXG4gIC8vICAgdmFyIGFybV90aXAgPSBub2Rlc1tub2Rlcy5sZW5ndGggLSAxXVxuICAvL1xuICAvLyAgIHZhciBkaXN0YW5jZV94ID0gdGFyZ2V0X3ggLSBhcm1fdGlwLnhcbiAgLy8gICB2YXIgZGlzdGFuY2VfeSA9IHRhcmdldF95IC0gYXJtX3RpcC55XG4gIC8vXG4gIC8vICAgYXJtX3RpcC54ICs9IGRpc3RhbmNlX3ggLyAxMFxuICAvLyAgIGFybV90aXAueSArPSBkaXN0YW5jZV95IC8gMTBcbiAgLy8gfSlcblxuICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRpY2spXG59XG50aWNrKClcblxuYXJtcy5mb3JFYWNoKGZ1bmN0aW9uIChhcm0pIHtcbiAgdmFyIHNpbXVsYXRpb24gPSBhcm0uc2ltdWxhdGlvblxuICB2YXIgbm9kZXMgPSBzaW11bGF0aW9uLm5vZGVzKClcbiAgdmFyIGxpbmtzID0gYXJtLmxpbmtzXG4gIHZhciBsaW5rID0gYXJtLmxpbmtcbiAgdmFyIG5vZGUgPSBhcm0ubm9kZVxuICB2YXIgZGF0YSA9IGFybS5kYXRhXG4gIHZhciBjb3VudCA9IGFybS5jb3VudFxuXG4gIHNpbXVsYXRpb24ub24oJ3RpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkgKz0gYXJtLmNvdW50KSB7XG4gICAgICBub2Rlc1tpXS54ID0gaGVhZF9wb3NpdGlvbi54XG4gICAgICBub2Rlc1tpXS55ID0gaGVhZF9wb3NpdGlvbi55XG4gICAgfVxuXG4gICAgaWYgKHdpbmRvdy51c2VfcGF0aCA9PT0gdHJ1ZSkge1xuICAgICAgZGF0YSA9IFtdXG4gICAgICBub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgIGRhdGEucHVzaCh7IHg6IG5vZGUueCwgeTogbm9kZS55IH0pXG4gICAgICB9KVxuICAgICAgYXJtLmxpbmsuZGF0dW0oZGF0YSkudHJhbnNpdGlvbigpXG4gICAgICAgIC5hdHRyKCdkJywgYXJtLmxpbmVfZ2VuZXJhdG9yKVxuICAgIH0gZWxzZSB7XG4gICAgICBhcm0ubGluay5hdHRyKCd4MScsIGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLnNvdXJjZS54IH0pXG4gICAgICAgIC5hdHRyKCd5MScsIGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLnNvdXJjZS55IH0pXG4gICAgICAgIC5hdHRyKCd4MicsIGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLnRhcmdldC54IH0pXG4gICAgICAgIC5hdHRyKCd5MicsIGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLnRhcmdldC55IH0pXG4gICAgfVxuICAgIG5vZGUuYXR0cigndHJhbnNmb3JtJywgZnVuY3Rpb24gKGQsIGkpIHtcbiAgICAgIHJldHVybiAndHJhbnNsYXRlKCcgKyBkLnggKyAnICcgKyBkLnkgKyAnKSdcbiAgICB9KVxuICB9KVxuXG4gIHNpbXVsYXRpb24ub24oJ2VuZCcsIGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLmxvZygnZW5kJylcbiAgICBub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uIChub2RlLCBpZHgpIHtcbiAgICAgIHZhciB2ID0gMy4wXG4gICAgICBub2RlLnZ4ICs9IChNYXRoLnJhbmRvbSgpICogdikgLSAodiAqIDAuNSlcbiAgICAgIG5vZGUudnkgKz0gKE1hdGgucmFuZG9tKCkgKiB2KSAtICh2ICogMC41KVxuICAgIH0pXG4gICAgc2ltdWxhdGlvbi5hbHBoYSgoTWF0aC5yYW5kb20oKSAqIDAuMykgKyAwLjEpXG4gICAgc2ltdWxhdGlvbi5yZXN0YXJ0KClcbiAgfSlcbn0pXG4iXX0=
