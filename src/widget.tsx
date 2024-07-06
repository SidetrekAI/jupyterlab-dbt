import { ReactWidget } from '@jupyterlab/apputils'

import React, { useState } from 'react'

const DbtComponent = (): JSX.Element => {
  const [counter, setCounter] = useState(0)

  return (
    <div>
      <p>You clicked {counter} times!</p>
      <button
        onClick={(): void => {
          setCounter(counter + 1)
        }}
      >
        Increment
      </button>
    </div>
  )
}

// A Lumino widget that wraps a React component
export class DbtWidget extends ReactWidget {
  constructor() {
    super()
    this.addClass('jp-ReactWidget')
  }

  render(): JSX.Element {
    return <DbtComponent />
  }
}
