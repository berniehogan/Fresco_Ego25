import React from 'react';

export default class SVG extends React.PureComponent {
  render() {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        viewBox="0 0 35 31.3"
        {...this.props}
      >
        <path
          className="cls-1"
          d="M31.9,1.2L31.9,1.2c-1.7-1.7-4.3-1.7-6,0L3.1,24.1c-1.7,1.7-1.7,4.3,0,6l0,0c1.7,1.7,4.3,1.7,6,0L31.9,7.2C33.6,5.6,33.6,2.9,31.9,1.2z"
        />
        <path
          className="cls-1"
          d="M3.1,1.2L3.1,1.2c-1.7,1.7-1.7,4.3,0,6L26,30.1c1.7,1.7,4.3,1.7,6,0l0,0c1.7-1.7,1.7-4.3,0-6L9.1,1.2C7.4-0.4,4.8-0.4,3.1,1.2z"
        />
      </svg>
    );
  }
}
