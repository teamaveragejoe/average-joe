import React from 'react'

function Intro (props) {
  return (
    <div className='description' style={props.style}>
      <p>
        Want to check out a new place, but not somewhere <em>too</em> great? Do
        you long for the days when you weren't excited about anything? This app
        is for you! Pick your location, then search for something you're
        interested in. You'll get the most middle-of-the-road place we can find
        in terms of relevance to your search, with directions on how to get
        there. With any luck, you'll have no strong feelings one way or the
        other!
      </p>
    </div>
  )
}

export default Intro
