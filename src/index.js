/**
 * react-native-swiper
 * @author leecade<leecade@163.com>
 */
import React from 'react'
import PropTypes from 'prop-types'
import ReactNative, {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ViewPropTypes,
  Platform
} from 'react-native'
import ViewPagerAndroid from "@react-native-community/viewpager"
var createReactClass = require('create-react-class');

// Using bare setTimeout, setInterval, setImmediate
// and requestAnimationFrame calls is very dangerous
// because if you forget to cancel the request before
// the component is unmounted, you risk the callback
// throwing an exception.
import TimerMixin from 'react-timer-mixin'

let { width, height } = Dimensions.get('window')

/**
 * Default styles
 * @type {StyleSheetPropType}
 */
let styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    position: 'relative',
  },

  wrapper: {
    backgroundColor: 'transparent',
  },

  slide: {
    backgroundColor: 'transparent',
  },

  pagination_x: {
    position: 'absolute',
    bottom: 25,
    left: 0,
    right: 0,
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'transparent',
  },

  pagination_y: {
    position: 'absolute',
    right: 15,
    top: 0,
    bottom: 0,
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'transparent',
  },

  title: {
    height: 30,
    justifyContent: 'center',
    position: 'absolute',
    paddingLeft: 10,
    bottom: -30,
    left: 0,
    flexWrap: 'nowrap',
    width: 250,
    backgroundColor: 'transparent',
  },

  buttonWrapper: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    position: 'absolute',
    top: 0,
    left: 0,
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  buttonText: {
    fontSize: 50,
    color: '#007aff',
    fontFamily: 'Arial',
  },
})

// missing `module.exports = exports['default'];` with babel6
// export default React.createClass({
module.exports = createReactClass({

  /**
   * Props Validation
   * @type {Object}
   */
  propTypes: {
    horizontal                       : PropTypes.bool,
    children                         : PropTypes.node.isRequired,
    style                            :   ViewPropTypes.style,
    pagingEnabled                    : PropTypes.bool,
    showsHorizontalScrollIndicator   : PropTypes.bool,
    showsVerticalScrollIndicator     : PropTypes.bool,
    bounces                          : PropTypes.bool,
    scrollsToTop                     : PropTypes.bool,
    removeClippedSubviews            : PropTypes.bool,
    automaticallyAdjustContentInsets : PropTypes.bool,
    showsPagination                  : PropTypes.bool,
    showsButtons                     : PropTypes.bool,
    loop                             : PropTypes.bool,
    autoplay                         : PropTypes.bool,
    autoplayTimeout                  : PropTypes.number,
    autoplayDirection                : PropTypes.bool,
    index                            : PropTypes.number,
    renderPagination                 : PropTypes.func,
    onScroll                         : PropTypes.func,
  },

  mixins: [TimerMixin],

  /**
   * Default props
   * @return {object} props
   * @see http://facebook.github.io/react-native/docs/scrollview.html
   */
  getDefaultProps() {
    return {
      horizontal                       : true,
      pagingEnabled                    : true,
      showsHorizontalScrollIndicator   : false,
      showsVerticalScrollIndicator     : false,
      bounces                          : false,
      scrollsToTop                     : false,
      removeClippedSubviews            : true,
      automaticallyAdjustContentInsets : false,
      showsPagination                  : true,
      showsButtons                     : false,
      loop                             : true,
      autoplay                         : false,
      autoplayTimeout                  : 2.5,
      autoplayDirection                : true,
      index                            : 0,
    }
  },

  /**
   * Init states
   * @return {object} states
   */
  getInitialState() {
    return this.initState(this.props)
  },

  /**
   * autoplay timer
   * @type {null}
   */
  autoplayTimer: null,

  componentWillMount() {
    this.props = this.injectState(this.props)
  },

  componentWillReceiveProps(props) {
    this.setState(this.initState(props))
  },

  componentDidMount() {
    this.autoplay()
  },

  initState(props) {
    let initState = {
      isScrolling: false,
      autoplayEnd: false,
    }

    initState.total = props.children ? props.children.length || 1 : 0
    initState.index = initState.total > 1 ? Math.min(props.index, initState.total - 1) : 0

    // Default: horizontal
    initState.dir = props.horizontal == false ? 'y' : 'x'
    initState.width = props.width || width
    initState.height = props.height || height
    initState.offset = {}

    if (initState.total > 1) {
      var setup = initState.index
      if ( props.loop ) {
        setup++
      }
      initState.offset[initState.dir] = initState.dir == 'y'
        ? initState.height * setup
        : initState.width * setup
    }
    return initState
  },

  /**
   * Automatic rolling
   */
  autoplay() {
    if(!Array.isArray(this.props.children)
      || !this.props.autoplay
      || this.state.isScrolling
      || this.state.autoplayEnd) return

    clearTimeout(this.autoplayTimer)

    this.autoplayTimer = this.setTimeout(() => {
      if(!this.props.loop && (this.props.autoplayDirection
          ? this.state.index == this.state.total - 1
          : this.state.index == 0)) return this.setState({
        autoplayEnd: true
      })
      this.scrollTo(this.props.autoplayDirection ? 1 : -1)
    }, this.props.autoplayTimeout * 1000)
  },

  /**
   * Scroll begin handle
   * @param  {object} e native event
   */
  onScrollBegin(e) {
    // update scroll state
    this.setState({
      isScrolling: true
    })

    this.setTimeout(() => {
      this.props.onScrollBeginDrag && this.props.onScrollBeginDrag(e, this.state, this)
    })
  },

  /**
   * Scroll end handle
   * @param  {object} e native event
   */
  onScrollEnd(e) {
    // update scroll state
    this.setState({
      isScrolling: false
    })

    // making our events coming from android compatible to updateIndex logic
    if (!e.nativeEvent.contentOffset) {
      if (this.state.dir == 'x') {
        e.nativeEvent.contentOffset = {x: e.nativeEvent.position * this.state.width}
      } else {
        e.nativeEvent.contentOffset = {y: e.nativeEvent.position * this.state.height}
      }
    }

    this.updateIndex(e.nativeEvent.contentOffset, this.state.dir)

    // Note: `this.setState` is async, so I call the `onMomentumScrollEnd`
    // in setTimeout to ensure synchronous update `index`
    this.setTimeout(() => {
      this.autoplay()

      // if `onMomentumScrollEnd` registered will be called here
      this.props.onMomentumScrollEnd && this.props.onMomentumScrollEnd(e, this.state, this)
    })
  },

  onScroll(e) {
    this.props.onScroll({ x: e.nativeEvent.contentOffset.x });
  },

  onAndroidScroll(e) {
    const event = e.nativeEvent;
    const x = event.position * this.state.width + event.offset * this.state.width;
    this.props.onScroll({ x });
  },


  /**
   * Update index after scroll
   * @param  {object} offset content offset
   * @param  {string} dir    'x' || 'y'
   */
  updateIndex(offset, dir) {

    let state = this.state
    let index = state.index
    let diff = offset[dir] - state.offset[dir]
    let step = dir == 'x' ? state.width : state.height

    // Do nothing if offset no change.
    if(!diff) return

    // Note: if touch very very quickly and continuous,
    // the variation of `index` more than 1.
    index = index + diff / step

    if(this.props.loop) {
      if(index <= -1) {
        index = state.total - 1
        offset[dir] = step * state.total
      }
      else if(index >= state.total) {
        index = 0
        offset[dir] = step
      }
    }

    this.setState({
      index: index,
      offset: offset,
    })
  },

  /**
   * Scroll by index
   * @param  {number} index offset index
   */
  scrollTo(index) {
    if (this.state.isScrolling || this.state.total < 2) return
    let state = this.state
    let diff = (this.props.loop ? 1 : 0) + index + this.state.index
    let x = 0
    let y = 0
    if(state.dir == 'x') x = diff * state.width
    if(state.dir == 'y') y = diff * state.height

    if (Platform.OS === 'android') {
      this.refs.scrollView && this.refs.scrollView.setPage(diff)
    } else {
      this.refs.scrollView && this.refs.scrollView.scrollTo({
        y: y,
        x: x
      })
    }

    // update scroll state
    this.setState({
      isScrolling: true,
      autoplayEnd: false,
    })

    // trigger onScrollEnd manually in android
    if (Platform.OS === 'android') {
      this.setTimeout(() => {
        this.onScrollEnd({
          nativeEvent: {
            position: diff,
          }
        });
      }, 50);
    }

  },

  /**
   * Render pagination
   * @return {object} react-dom
   */
  renderPagination() {

    // By default, dots only show when `total` > 2
    if(this.state.total <= 1) return null

    let dots = []
    let ActiveDot = this.props.activeDot || <View style={{
            backgroundColor: '#007aff',
            width: 8,
            height: 8,
            borderRadius: 4,
            marginLeft: 3,
            marginRight: 3,
            marginTop: 3,
            marginBottom: 3,
          }} />;
    let Dot = this.props.dot || <View style={{
            backgroundColor:'rgba(0,0,0,.2)',
            width: 8,
            height: 8,
            borderRadius: 4,
            marginLeft: 3,
            marginRight: 3,
            marginTop: 3,
            marginBottom: 3,
          }} />;
    for(let i = 0; i < this.state.total; i++) {
      dots.push(i === this.state.index
        ?
        React.cloneElement(ActiveDot, {key: i})
        :
        React.cloneElement(Dot, {key: i})
      )
    }

    return (
      <View pointerEvents='none' style={[styles['pagination_' + this.state.dir], this.props.paginationStyle]}>
        {dots}
      </View>
    )
  },

  renderTitle() {
    let child = this.props.children[this.state.index]
    let title = child && child.props.title
    return title
      ? (
        <View style={styles.title}>
          {this.props.children[this.state.index].props.title}
        </View>
      )
      : null
  },

  renderNextButton() {
    let button;

    if (this.props.loop || this.state.index != this.state.total - 1) {
      button = this.props.nextButton || <Text style={styles.buttonText}>›</Text>
    }

    return (
      <TouchableOpacity onPress={() => button !== null && this.scrollTo.call(this, 1)}>
        <View>
          {button}
        </View>
      </TouchableOpacity>
    )
  },

  renderPrevButton() {
    let button = null

    if (this.props.loop || this.state.index != 0) {
       button = this.props.prevButton || <Text style={styles.buttonText}>‹</Text>
    }

    return (
      <TouchableOpacity onPress={() => button !== null && this.scrollTo.call(this, -1)}>
        <View>
          {button}
        </View>
      </TouchableOpacity>
    )
  },

  renderButtons() {
    return (
      <View pointerEvents='box-none' style={[styles.buttonWrapper, {width: this.state.width, height: this.state.height}, this.props.buttonWrapperStyle]}>
        {this.renderPrevButton()}
        {this.renderNextButton()}
      </View>
    )
  },
  renderScrollView(pages) {
     if (Platform.OS === 'ios')
         return (
            <ScrollView ref="scrollView"
             {...this.props}
                       contentContainerStyle={[styles.wrapper, this.props.style]}
                       contentOffset={this.state.offset}
                       onScrollBeginDrag={this.onScrollBegin}
                       onMomentumScrollEnd={this.onScrollEnd}
                       onScroll={this.onScroll}
                       scrollEventThrottle={16}
                       >
             {pages}
            </ScrollView>
         );
      return (
         <ViewPagerAndroid ref="scrollView"
          {...this.props}
            initialPage={this.state.index}
            onPageSelected={this.onScrollEnd}
            style={{flex: 1}}
            onPageScroll={this.onAndroidScroll}
          >
            {pages}
         </ViewPagerAndroid>
      );
  },
  /**
   * Inject state to ScrollResponder
   * @param  {object} props origin props
   * @return {object} props injected props
   */
  injectState(props) {
/*    const scrollResponders = [
      'onMomentumScrollBegin',
      'onTouchStartCapture',
      'onTouchStart',
      'onTouchEnd',
      'onResponderRelease',
    ]*/

    for(let prop in props) {
      // if(~scrollResponders.indexOf(prop)
      if(typeof props[prop] === 'function'
        && prop !== 'onMomentumScrollEnd'
        && prop !== 'renderPagination'
        && prop !== 'onScrollBeginDrag'
        && prop !== 'onScroll'
      ) {
        let originResponder = props[prop]
        props[prop] = (e) => originResponder(e, this.state, this)
      }
    }

    return props
  },

  /**
   * Default render
   * @return {object} react-dom
   */
  render() {
    let state = this.state
    let props = this.props
    let children = props.children
    let index = state.index
    let total = state.total
    let loop = props.loop
    let dir = state.dir
    let key = 0

    let pages = []
    let pageStyle = [{width: state.width, height: state.height}, styles.slide]

    // For make infinite at least total > 1
    if(total > 1) {

      // Re-design a loop model for avoid img flickering
      pages = Object.keys(children)
      if(loop) {
        pages.unshift(total - 1)
        pages.push(0)
      }

      pages = pages.map((page, i) =>
        <View style={pageStyle} key={i}>{children[page]}</View>
      )
    }
    else pages = <View style={pageStyle}>{children}</View>

    return (
      <View style={[styles.container, {
        width: state.width,
        height: state.height
      }]}>
        {this.renderScrollView(pages)}
        {props.showsPagination && (props.renderPagination
          ? this.props.renderPagination(state.index, state.total, this)
          : this.renderPagination())}
        {this.renderTitle()}
        {this.props.showsButtons && this.renderButtons()}
      </View>
    )
  }
})
