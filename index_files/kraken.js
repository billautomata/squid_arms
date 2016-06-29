(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function arm (options) {
  var nodes = []
  var links = []
  var count = 10
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

  var mouse_force_x = d3.forceX().x(0).strength(0)
  var mouse_force_y = d3.forceY().y(0).strength(0)

  var simulation = d3.forceSimulation()
    // .alphaMin(0)
    .velocityDecay(0.01)
    .force('link', d3.forceLink().id(function (d) { return d.name; })
      .strength(1)
      .distance(function (d, i) { return (links.length - i + 1) * 5})
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

  svg = svg.append('g')
    .attr('transform', 'translate(0 0)')

  svg.append('rect').attr('x', 0).attr('y', 0).attr('width', 1000).attr('height', 500).style('opacity', 0)

  var link = svg.selectAll('.link')
    .data(links)
    .enter().append('line')
    .attr('class', 'link')
    .attr('stroke', 'black')
    .attr('fill', 'none')
    .attr('stroke-linecap', 'round')
    .style('stroke-opacity', 0.3)
    .style('stroke-width', function (d, i) {
      return (links.length - i)
    })

  var node = svg.selectAll('.node')
    .data(nodes)
    .enter().append('g').attr('class', 'node')

  // simulation.on('tick', function () {
    //   nodes[0].x = 500 + (Math.sin(Date.now() * 0.0005) * 500)
    //   nodes[0].y = 250
    //
    //   link.attr('x1', function (d) { return d.source.x })
    //     .attr('y1', function (d) { return d.source.y })
    //     .attr('x2', function (d) { return d.target.x })
    //     .attr('y2', function (d) { return d.target.y })
    //
    //   node.attr('transform', function (d, i) {
    //     return 'translate(' + d.x + ' ' + d.y + ')'
    //   })
    // })
    //
    // simulation.on('end', function () {
    //   console.log('end')
    //
    //   nodes.forEach(function (node, idx) {
    //     // console.log(link)
    //     var v = 5.0
    //     node.vx += (Math.random() * v) - (v * 0.5)
    //     node.vy += (Math.random() * v) - (v * 0.5)
    //   })
    //
    //   simulation.alpha(0.1)
    //   simulation.restart()
    // })

  return {
    simulation: simulation,
    link: link,
    node: node
  }

}

},{}],2:[function(require,module,exports){
console.log('hello from the kraken!')

console.log('lol')

var w = 1000
var h = 500

var d3 = window.d3

var div_kraken = d3.select('div#kraken')
var svg = div_kraken.append('svg')
  .attr('viewBox', '0 0 ' + w + ' ' + h)
  .attr('width', '100%')
  .attr('preserveAspectRatio', 'xMidYMid')
  .style('background-color', 'rgba(0,0,0,0.1)')

var arm_maker = require('./create/arm.js')
var arms = []

for (var i = 0; i < 8; i++) {
  arms.push(arm_maker({
    parent: svg
  }))
}

var head_position = {
  x: w * 0.5,
  y: h * 0.5,
  vx: Math.random() - 0.5,
  vy: Math.random() - 0.5
}
var tick = function () {
  head_position.x += head_position.vx
  head_position.y += head_position.vy

  if (head_position.x > w) {
    head_position.x -= (head_position.x - w)
    head_position.vx *= -1
  }
  if (head_position.x < 0) {
    head_position.x += (-head_position.x)
    head_position.vx *= -1
  }
  if (head_position.y > h) {
    head_position.y -= (head_position.y - h)
    head_position.vy *= -1
  }
  if (head_position.y < 0) {
    head_position.y += (-head_position.y)
    head_position.vy *= -1
  }

  var alpha = head_position.vx
  head_position.vx *= 0.99
  head_position.vy *= 0.99
  if (Math.abs(alpha - head_position.vx) < 0.001) {
    var v = 3.0
    head_position.vx += (Math.random() * v) - (v * 0.5)
    head_position.vy += (Math.random() * v) - (v * 0.5)
  }
  window.requestAnimationFrame(tick)
}
tick()

arms.forEach(function (arm) {
  var simulation = arm.simulation
  var nodes = simulation.nodes()
  var link = arm.link
  var node = arm.node

  simulation.on('tick', function () {
    nodes[0].x = head_position.x
    nodes[0].y = head_position.y

    link.attr('x1', function (d) { return d.source.x })
      .attr('y1', function (d) { return d.source.y })
      .attr('x2', function (d) { return d.target.x })
      .attr('y2', function (d) { return d.target.y })

    node.attr('transform', function (d, i) {
      return 'translate(' + d.x + ' ' + d.y + ')'
    })
  })

  simulation.on('end', function () {
    console.log('end')

    nodes.forEach(function (node, idx) {
      // console.log(link)
      var v = 1.0
      node.vx += (Math.random() * v) - (v * 0.5)
      node.vy += (Math.random() * v) - (v * 0.5)
    })

    simulation.alpha(0.1)
    simulation.restart()
  })
})

},{"./create/arm.js":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJrcmFrZW4vY3JlYXRlL2FybS5qcyIsImtyYWtlbi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYXJtIChvcHRpb25zKSB7XG4gIHZhciBub2RlcyA9IFtdXG4gIHZhciBsaW5rcyA9IFtdXG4gIHZhciBjb3VudCA9IDEwXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgIG5vZGVzLnB1c2goe1xuICAgICAgbmFtZTogaSxcbiAgICAgIHR5cGU6ICduYSdcbiAgICB9KVxuICAgIGlmIChpIDwgY291bnQgLSAxKSB7XG4gICAgICBsaW5rcy5wdXNoKHtcbiAgICAgICAgc291cmNlOiBpLFxuICAgICAgICB0YXJnZXQ6IGkgKyAxLFxuICAgICAgICB2YWx1ZTogaVxuICAgICAgfSlcbiAgICB9XG4gIH1cbiAgdmFyIGQzID0gd2luZG93LmQzXG5cbiAgdmFyIG1vdXNlX2ZvcmNlX3ggPSBkMy5mb3JjZVgoKS54KDApLnN0cmVuZ3RoKDApXG4gIHZhciBtb3VzZV9mb3JjZV95ID0gZDMuZm9yY2VZKCkueSgwKS5zdHJlbmd0aCgwKVxuXG4gIHZhciBzaW11bGF0aW9uID0gZDMuZm9yY2VTaW11bGF0aW9uKClcbiAgICAvLyAuYWxwaGFNaW4oMClcbiAgICAudmVsb2NpdHlEZWNheSgwLjAxKVxuICAgIC5mb3JjZSgnbGluaycsIGQzLmZvcmNlTGluaygpLmlkKGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLm5hbWU7IH0pXG4gICAgICAuc3RyZW5ndGgoMSlcbiAgICAgIC5kaXN0YW5jZShmdW5jdGlvbiAoZCwgaSkgeyByZXR1cm4gKGxpbmtzLmxlbmd0aCAtIGkgKyAxKSAqIDV9KVxuICApXG4gICAgLmZvcmNlKCdtYW55JywgZDMuZm9yY2VNYW55Qm9keSgpLnN0cmVuZ3RoKC0yKSlcbiAgICAvLyAuZm9yY2UoJ2NlbnRlcicsIGQzLmZvcmNlQ2VudGVyKCkueCg1MDApLnkoMjUwKSlcblxuICBzaW11bGF0aW9uLm5vZGVzKG5vZGVzKVxuICBzaW11bGF0aW9uLmZvcmNlKCdsaW5rJykubGlua3MobGlua3MpXG5cbiAgd2luZG93LnMgPSBzaW11bGF0aW9uXG5cbiAgbm9kZXMuZm9yRWFjaChmdW5jdGlvbiAobm9kZSwgaWR4KSB7XG4gICAgLy8gY29uc29sZS5sb2cobGluaylcbiAgICB2YXIgdiA9IDE1LjBcbiAgICBub2RlLnggPSA1MDBcbiAgICBub2RlLnkgPSAyNTBcbiAgICBub2RlLnZ4ICs9IChNYXRoLnJhbmRvbSgpICogdikgLSAodiAqIDAuNSlcbiAgICBub2RlLnZ5ICs9IChNYXRoLnJhbmRvbSgpICogdikgLSAodiAqIDAuNSlcbiAgfSlcbiAgdmFyIHN2ZyA9IG9wdGlvbnMucGFyZW50XG5cbiAgc3ZnID0gc3ZnLmFwcGVuZCgnZycpXG4gICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoMCAwKScpXG5cbiAgc3ZnLmFwcGVuZCgncmVjdCcpLmF0dHIoJ3gnLCAwKS5hdHRyKCd5JywgMCkuYXR0cignd2lkdGgnLCAxMDAwKS5hdHRyKCdoZWlnaHQnLCA1MDApLnN0eWxlKCdvcGFjaXR5JywgMClcblxuICB2YXIgbGluayA9IHN2Zy5zZWxlY3RBbGwoJy5saW5rJylcbiAgICAuZGF0YShsaW5rcylcbiAgICAuZW50ZXIoKS5hcHBlbmQoJ2xpbmUnKVxuICAgIC5hdHRyKCdjbGFzcycsICdsaW5rJylcbiAgICAuYXR0cignc3Ryb2tlJywgJ2JsYWNrJylcbiAgICAuYXR0cignZmlsbCcsICdub25lJylcbiAgICAuYXR0cignc3Ryb2tlLWxpbmVjYXAnLCAncm91bmQnKVxuICAgIC5zdHlsZSgnc3Ryb2tlLW9wYWNpdHknLCAwLjMpXG4gICAgLnN0eWxlKCdzdHJva2Utd2lkdGgnLCBmdW5jdGlvbiAoZCwgaSkge1xuICAgICAgcmV0dXJuIChsaW5rcy5sZW5ndGggLSBpKVxuICAgIH0pXG5cbiAgdmFyIG5vZGUgPSBzdmcuc2VsZWN0QWxsKCcubm9kZScpXG4gICAgLmRhdGEobm9kZXMpXG4gICAgLmVudGVyKCkuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnbm9kZScpXG5cbiAgLy8gc2ltdWxhdGlvbi5vbigndGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAvLyAgIG5vZGVzWzBdLnggPSA1MDAgKyAoTWF0aC5zaW4oRGF0ZS5ub3coKSAqIDAuMDAwNSkgKiA1MDApXG4gICAgLy8gICBub2Rlc1swXS55ID0gMjUwXG4gICAgLy9cbiAgICAvLyAgIGxpbmsuYXR0cigneDEnLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC5zb3VyY2UueCB9KVxuICAgIC8vICAgICAuYXR0cigneTEnLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC5zb3VyY2UueSB9KVxuICAgIC8vICAgICAuYXR0cigneDInLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC50YXJnZXQueCB9KVxuICAgIC8vICAgICAuYXR0cigneTInLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC50YXJnZXQueSB9KVxuICAgIC8vXG4gICAgLy8gICBub2RlLmF0dHIoJ3RyYW5zZm9ybScsIGZ1bmN0aW9uIChkLCBpKSB7XG4gICAgLy8gICAgIHJldHVybiAndHJhbnNsYXRlKCcgKyBkLnggKyAnICcgKyBkLnkgKyAnKSdcbiAgICAvLyAgIH0pXG4gICAgLy8gfSlcbiAgICAvL1xuICAgIC8vIHNpbXVsYXRpb24ub24oJ2VuZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAvLyAgIGNvbnNvbGUubG9nKCdlbmQnKVxuICAgIC8vXG4gICAgLy8gICBub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uIChub2RlLCBpZHgpIHtcbiAgICAvLyAgICAgLy8gY29uc29sZS5sb2cobGluaylcbiAgICAvLyAgICAgdmFyIHYgPSA1LjBcbiAgICAvLyAgICAgbm9kZS52eCArPSAoTWF0aC5yYW5kb20oKSAqIHYpIC0gKHYgKiAwLjUpXG4gICAgLy8gICAgIG5vZGUudnkgKz0gKE1hdGgucmFuZG9tKCkgKiB2KSAtICh2ICogMC41KVxuICAgIC8vICAgfSlcbiAgICAvL1xuICAgIC8vICAgc2ltdWxhdGlvbi5hbHBoYSgwLjEpXG4gICAgLy8gICBzaW11bGF0aW9uLnJlc3RhcnQoKVxuICAgIC8vIH0pXG5cbiAgcmV0dXJuIHtcbiAgICBzaW11bGF0aW9uOiBzaW11bGF0aW9uLFxuICAgIGxpbms6IGxpbmssXG4gICAgbm9kZTogbm9kZVxuICB9XG5cbn1cbiIsImNvbnNvbGUubG9nKCdoZWxsbyBmcm9tIHRoZSBrcmFrZW4hJylcblxuY29uc29sZS5sb2coJ2xvbCcpXG5cbnZhciB3ID0gMTAwMFxudmFyIGggPSA1MDBcblxudmFyIGQzID0gd2luZG93LmQzXG5cbnZhciBkaXZfa3Jha2VuID0gZDMuc2VsZWN0KCdkaXYja3Jha2VuJylcbnZhciBzdmcgPSBkaXZfa3Jha2VuLmFwcGVuZCgnc3ZnJylcbiAgLmF0dHIoJ3ZpZXdCb3gnLCAnMCAwICcgKyB3ICsgJyAnICsgaClcbiAgLmF0dHIoJ3dpZHRoJywgJzEwMCUnKVxuICAuYXR0cigncHJlc2VydmVBc3BlY3RSYXRpbycsICd4TWlkWU1pZCcpXG4gIC5zdHlsZSgnYmFja2dyb3VuZC1jb2xvcicsICdyZ2JhKDAsMCwwLDAuMSknKVxuXG52YXIgYXJtX21ha2VyID0gcmVxdWlyZSgnLi9jcmVhdGUvYXJtLmpzJylcbnZhciBhcm1zID0gW11cblxuZm9yICh2YXIgaSA9IDA7IGkgPCA4OyBpKyspIHtcbiAgYXJtcy5wdXNoKGFybV9tYWtlcih7XG4gICAgcGFyZW50OiBzdmdcbiAgfSkpXG59XG5cbnZhciBoZWFkX3Bvc2l0aW9uID0ge1xuICB4OiB3ICogMC41LFxuICB5OiBoICogMC41LFxuICB2eDogTWF0aC5yYW5kb20oKSAtIDAuNSxcbiAgdnk6IE1hdGgucmFuZG9tKCkgLSAwLjVcbn1cbnZhciB0aWNrID0gZnVuY3Rpb24gKCkge1xuICBoZWFkX3Bvc2l0aW9uLnggKz0gaGVhZF9wb3NpdGlvbi52eFxuICBoZWFkX3Bvc2l0aW9uLnkgKz0gaGVhZF9wb3NpdGlvbi52eVxuXG4gIGlmIChoZWFkX3Bvc2l0aW9uLnggPiB3KSB7XG4gICAgaGVhZF9wb3NpdGlvbi54IC09IChoZWFkX3Bvc2l0aW9uLnggLSB3KVxuICAgIGhlYWRfcG9zaXRpb24udnggKj0gLTFcbiAgfVxuICBpZiAoaGVhZF9wb3NpdGlvbi54IDwgMCkge1xuICAgIGhlYWRfcG9zaXRpb24ueCArPSAoLWhlYWRfcG9zaXRpb24ueClcbiAgICBoZWFkX3Bvc2l0aW9uLnZ4ICo9IC0xXG4gIH1cbiAgaWYgKGhlYWRfcG9zaXRpb24ueSA+IGgpIHtcbiAgICBoZWFkX3Bvc2l0aW9uLnkgLT0gKGhlYWRfcG9zaXRpb24ueSAtIGgpXG4gICAgaGVhZF9wb3NpdGlvbi52eSAqPSAtMVxuICB9XG4gIGlmIChoZWFkX3Bvc2l0aW9uLnkgPCAwKSB7XG4gICAgaGVhZF9wb3NpdGlvbi55ICs9ICgtaGVhZF9wb3NpdGlvbi55KVxuICAgIGhlYWRfcG9zaXRpb24udnkgKj0gLTFcbiAgfVxuXG4gIHZhciBhbHBoYSA9IGhlYWRfcG9zaXRpb24udnhcbiAgaGVhZF9wb3NpdGlvbi52eCAqPSAwLjk5XG4gIGhlYWRfcG9zaXRpb24udnkgKj0gMC45OVxuICBpZiAoTWF0aC5hYnMoYWxwaGEgLSBoZWFkX3Bvc2l0aW9uLnZ4KSA8IDAuMDAxKSB7XG4gICAgdmFyIHYgPSAzLjBcbiAgICBoZWFkX3Bvc2l0aW9uLnZ4ICs9IChNYXRoLnJhbmRvbSgpICogdikgLSAodiAqIDAuNSlcbiAgICBoZWFkX3Bvc2l0aW9uLnZ5ICs9IChNYXRoLnJhbmRvbSgpICogdikgLSAodiAqIDAuNSlcbiAgfVxuICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRpY2spXG59XG50aWNrKClcblxuYXJtcy5mb3JFYWNoKGZ1bmN0aW9uIChhcm0pIHtcbiAgdmFyIHNpbXVsYXRpb24gPSBhcm0uc2ltdWxhdGlvblxuICB2YXIgbm9kZXMgPSBzaW11bGF0aW9uLm5vZGVzKClcbiAgdmFyIGxpbmsgPSBhcm0ubGlua1xuICB2YXIgbm9kZSA9IGFybS5ub2RlXG5cbiAgc2ltdWxhdGlvbi5vbigndGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICBub2Rlc1swXS54ID0gaGVhZF9wb3NpdGlvbi54XG4gICAgbm9kZXNbMF0ueSA9IGhlYWRfcG9zaXRpb24ueVxuXG4gICAgbGluay5hdHRyKCd4MScsIGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLnNvdXJjZS54IH0pXG4gICAgICAuYXR0cigneTEnLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC5zb3VyY2UueSB9KVxuICAgICAgLmF0dHIoJ3gyJywgZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQudGFyZ2V0LnggfSlcbiAgICAgIC5hdHRyKCd5MicsIGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLnRhcmdldC55IH0pXG5cbiAgICBub2RlLmF0dHIoJ3RyYW5zZm9ybScsIGZ1bmN0aW9uIChkLCBpKSB7XG4gICAgICByZXR1cm4gJ3RyYW5zbGF0ZSgnICsgZC54ICsgJyAnICsgZC55ICsgJyknXG4gICAgfSlcbiAgfSlcblxuICBzaW11bGF0aW9uLm9uKCdlbmQnLCBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2coJ2VuZCcpXG5cbiAgICBub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uIChub2RlLCBpZHgpIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKGxpbmspXG4gICAgICB2YXIgdiA9IDEuMFxuICAgICAgbm9kZS52eCArPSAoTWF0aC5yYW5kb20oKSAqIHYpIC0gKHYgKiAwLjUpXG4gICAgICBub2RlLnZ5ICs9IChNYXRoLnJhbmRvbSgpICogdikgLSAodiAqIDAuNSlcbiAgICB9KVxuXG4gICAgc2ltdWxhdGlvbi5hbHBoYSgwLjEpXG4gICAgc2ltdWxhdGlvbi5yZXN0YXJ0KClcbiAgfSlcbn0pXG4iXX0=
