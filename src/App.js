import React, { Component } from 'react';
import './App.css';
import Hammer from 'hammerjs'

import { SketchPicker } from 'react-color'
import reactCSS from 'reactcss'
import tinycolor from 'tinycolor2'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      displayColorPickers: true,
      backgroundColor: "#222222",
      lineColor: "#CA1228",
      fillColor: "#f5f5f5",
      columns: 4,
      rows: 6,
      padding: 50,
      innerPadding: 15,
      lineWidth: 4,
      running: false
    }
  }

  componentWillMount () {
    this.updateDimensions()
  }

  componentWillUnmount () {
    window.removeEventListener("resize", this.updateDimensions.bind(this), true)
    window.removeEventListener('keydown', this.handleKeydown.bind(this), true)
    window.clearInterval(this.interval)
  }

  componentDidMount () {
    window.addEventListener("resize", this.updateDimensions.bind(this), true)
    window.addEventListener('keydown', this.handleKeydown.bind(this), true)
    this.interval = window.setInterval(this.tick.bind(this), 400)

    const mc = new Hammer(document, { preventDefault: true })

    mc.get('swipe').set({ direction: Hammer.DIRECTION_ALL })
    mc.get('pinch').set({ enable: true })

    
     mc.on("swipedown", ev => this.decrementRows())
      .on("swipeup", ev => this.incrementRows())
      .on("swipeleft", ev => this.decrementColumns())
      .on("swiperight", ev => this.incrementColumns())
      .on("pinchin", ev => { this.incrementRows(); this.incrementColumns();  } )
      .on("pinchout", ev => { this.decrementRows(); this.decrementColumns();  })
  }

  incrementRows () {
    this.setState({rows: Math.min(40, this.state.rows + 1)})
  }

  decrementRows () {
    this.setState({rows: Math.max(3, this.state.rows - 1)})
  }

  incrementColumns () {
    this.setState({columns: Math.min(10, this.state.columns + 1) })
  }

  decrementColumns () {
    this.setState({columns: Math.max(1, this.state.columns - 1) })
  }

  handleSave () {
    const svgData = document.getElementsByTagName('svg')[0].outerHTML   
    const link = document.createElement('a')
    
    var svgBlob = new Blob([svgData], { type:"image/svg+xml;charset=utf-8" })
    var svgURL = URL.createObjectURL(svgBlob)
    link.href = svgURL 

    link.setAttribute('download', `radiate.svg`)
    link.click()
  }

  between (min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
  }

  getActualHeight () {
    return this.state.height-2*this.state.padding
  }

  getActualWidth () {
    return this.state.width-2*this.state.padding
  }

  toggleRun() {
    this.setState({running: !this.state.running})
  }

  tick () {
    if (this.state.running) {
      this.forceUpdate()
    }
  }

  shuffle(a) {
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
  }

  generateRandomNumbers (n, m, minRandom) {
    let i = 0
    let randNums = []
    let sum = 0
    
    for (i = 0; i < n; i++) {
      randNums[i] = Math.max(Math.random(), minRandom)
      sum += randNums[i]
    }

    for (i = 0; i < n; i++) {
      randNums[i] /= sum
      randNums[i] *= m
    }

    return randNums;
  }

  getInnerHeight () {
    return this.getActualHeight() - 2*this.state.innerPadding
  }

  getInnerWidth () {
    return this.getActualWidth() - 2*this.state.innerPadding
  }

  updateDimensions () {
    const w = window,
        d = document,
        documentElement = d.documentElement,
        body = d.getElementsByTagName('body')[0]
    
    const width = w.innerWidth || documentElement.clientWidth || body.clientWidth,
        height = w.innerHeight|| documentElement.clientHeight|| body.clientHeight

    //const dim = Math.min(width, height)
    const settings = { width: width, height: height }

    if (width < 500) {
      settings.height = width
      settings.padding = 0
      settings.innerPadding = 40
    } else {
      settings.padding = 50
      settings.innerPadding = settings.padding
    }

    this.setState(settings)
  }

  handleKeydown (ev) {
    if (ev.which === 67 && !(ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.setState({displayColorPickers: !this.state.displayColorPickers})
    } else if (ev.which === 83 && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.handleSave()
    } else if (ev.which === 82 && !(ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.forceUpdate()
    } else if (ev.which === 84) {
      ev.preventDefault()
      this.toggleRun()
    } else if (ev.which === 40 && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      //this.decrementStrokeWidth()
    } else if (ev.which === 40) {
      ev.preventDefault()
      this.decrementRows()
    } else if (ev.which === 38 && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      //this.incrementStrokeWidth()
    } else if (ev.which === 38) {
      ev.preventDefault()
      this.incrementRows()
    } else if (ev.which === 37 && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      //this.decrementTreeWidth()
    } else if (ev.which === 37) {
      ev.preventDefault()
      this.decrementColumns()
    } else if (ev.which === 39 && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      //this.incrementTreeWidth()
    } else if (ev.which === 39) {
      ev.preventDefault()
      this.incrementColumns()
    }
  }

  generateLines () {
    const colWidth = this.getInnerWidth()/this.state.columns
    const rowWidth = this.getInnerHeight()/this.state.rows
    const lines = []

    const y1 = (this.getActualHeight()-this.getInnerHeight())/2
    const y2 = y1 + this.getInnerHeight()

    const startingPoint = (this.getActualWidth()-this.getInnerWidth())/2

    for (let i = 0; i < this.state.columns + 1; i ++) {
      let x = startingPoint + i*colWidth - this.state.lineWidth/2
      
      let yStartOffset = 0
      let yEndOffset = 0

      let offset = this.getInnerHeight()/this.state.rows
 
      if (i === 0) {
        yStartOffset = offset
      } else if (i === this.state.columns) {
        if (i%2 !== 0) {
          yStartOffset = offset
        } else {
          yEndOffset = offset
        }
      } else {
        yStartOffset = offset
        yEndOffset = offset
      }

      lines.push(
        <line key={`col-${i}`} x1={x} x2={x} y1={y1 + yStartOffset} y2={y2 - yEndOffset}
          stroke={this.state.lineColor} strokeWidth={this.state.lineWidth} />
      )

      if (i < this.state.columns) {
        lines.push(
          <path key={`curve-${i}`} d={
              i % 2 === 0 ?
                `M ${x} ${y1+rowWidth} A ${colWidth/2} ${rowWidth} 0 0 1 ${x+colWidth} ${y1+rowWidth}` :
                `M ${x} ${y2-rowWidth} A ${colWidth/2} ${rowWidth} 0 0 0 ${x+colWidth} ${y2-rowWidth}`
            }
            stroke={this.state.lineColor}
            fill={'transparent'}
            strokeWidth={this.state.lineWidth} />
        )
      }
    }

    return lines
  }

  generateFills () {
    const fills = []
    const xStart = (this.getActualWidth()-this.getInnerWidth())/2
    const yStart = (this.getActualHeight()-this.getInnerHeight())/2

    const colLength = this.getInnerWidth()/this.state.columns
    const rowLength = this.getInnerHeight()/this.state.rows

    for (let y = 1; y < this.state.rows - 1; y++) {
      for (let x = 0; x < this.state.columns; x++) {
        const r = Math.random()

        const xCorner = xStart + x * colLength - this.state.lineWidth/2
        const yCorner = yStart + y * rowLength

        if (r >= 0.5) {
          fills.push(
            <rect key={`bg-${xCorner}-${yCorner}`} x={xCorner} y={yCorner}
                  width={colLength} height={rowLength}
                  fill={this.state.fillColor} stroke={this.state.fillColor} strokeWidth={1} />
          )
        } else {

        }

        const r2 = Math.random()
        const col = r >= 0.5 ? this.state.backgroundColor: this.state.fillColor
        if (r2 >= 0.5) {
          let transform

          const r3 = Math.random()
          
          if (r3 <= 0.25){
            transform = `translate(${xCorner+xCorner+colLength},0) scale(-1, 1)`
          } else if (r3 <= 0.5) {
            transform = `translate(${yCorner+yCorner+rowLength},0) scale(1, -1)`
          } else if (r3 <= 0.75) {
            transform = `rotate(180, ${xCorner + colLength/2}, ${yCorner+rowLength/2})`
          }

          fills.push(
            <path key={`fill-${xCorner}-${yCorner}`}
              d={
                `M ${xCorner} ${yCorner} A ${colLength} ${rowLength} 0 0 0 ${xCorner + colLength} ${yCorner + rowLength}
                  L ${xCorner} ${yCorner+rowLength}`
              }
              fill={col} stroke={col} strokeWidth={1} transform={transform} />
          )
        }
        
      }
    }
    return fills
  }

  render() {
    const actualHeight = this.getActualHeight()
    const actualWidth = this.getActualWidth()

    return (
      <div className="App">
        { this.state.displayColorPickers ? <div className="color-pickers">
          <ColorPicker color={tinycolor(this.state.backgroundColor).toRgb()} disableAlpha={true}
            handleChange={ (color) => this.setState({backgroundColor: color.hex}) } />
          <ColorPicker color={tinycolor(this.state.lineColor).toRgb()} disableAlpha={true}
            handleChange={ (color) => this.setState({lineColor: color.hex}) } />
          <ColorPicker color={tinycolor(this.state.fillColor).toRgb()} disableAlpha={true}
            handleChange={ (color) => this.setState({fillColor: color.hex}) } />
            </div> : null
        }

        <div style={{ padding: this.state.padding }}> 
          <svg width={actualWidth} height={actualHeight}>
            <rect width={"100%"} height={"100%"} fill={this.state.backgroundColor} />
            <rect width={actualWidth} height={actualHeight}
                  stroke={'black'} fill={'transparent'} />

            {this.generateFills()}
            {this.generateLines()}
          </svg>
        </div>
      </div>
    );
  }
}

class ColorPicker extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      color: props.color,
      displayColorPicker: props.displayColorPicker,
      disableAlpha: props.disableAlpha
    }
  }

  handleClick = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
  };

  handleClose = () => {
    this.setState({ displayColorPicker: false })
    if (this.props.handleClose) {
      this.props.handleClose()
    }
  };

  handleChange = (color) => {
    this.setState({ color: color.rgb })
    this.props.handleChange(color)
  };

  render () {

    const styles = reactCSS({
      'default': {
        color: {
          background: this.state.disableAlpha ?
                `rgb(${ this.state.color.r }, ${ this.state.color.g }, ${ this.state.color.b })` :
                `rgba(${ this.state.color.r }, ${ this.state.color.g }, ${ this.state.color.b },  ${ this.state.color.a })`,
        },
        popover: {
          position: 'absolute',
          zIndex: '10',
        },
        cover: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
      },
    })

    return (
      <div className='color-picker'>
        <div className='swatch' onClick={ this.handleClick }>
          <div className='color' style={ styles.color } />
        </div>
        { this.state.displayColorPicker ? <div style={ styles.popover }>
          <div style={ styles.cover } onClick={ this.handleClose }/>
          <SketchPicker color={ this.state.color } onChange={ this.handleChange } disableAlpha={this.state.disableAlpha} />
        </div> : null }
      </div>
    )
  }
}

export default App;
