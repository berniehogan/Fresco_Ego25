import React from 'react';

export default class SVG extends React.PureComponent {
  render() {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        {...this.props}
      >
        <title>Add-Protocol</title>
        <g id="Server">
          <circle className="cls-1" cx="205.19" cy="270.52" r="203.22" />
          <ellipse
            className="cls-2"
            cx="409.32"
            cy="139.87"
            rx="100.71"
            ry="101.61"
          />
          <rect
            className="cls-3"
            x="402.06"
            y="107.21"
            width="14.52"
            height="65.32"
          />
          <rect
            className="cls-3"
            x="402.06"
            y="107.21"
            width="14.52"
            height="65.32"
            transform="translate(269.45 549.19) rotate(-90)"
          />
          <path
            className="cls-4"
            d="M274.56,399.66H142.62a27.9,27.9,0,0,1-27.9-27.89v-191a27.9,27.9,0,0,1,27.9-27.9h85.22L302.46,229V371.77A27.9,27.9,0,0,1,274.56,399.66Z"
          />
          <g id="NC-Flat">
            <circle className="cls-5" cx="208.71" cy="302.86" r="66.46" />
            <circle className="cls-8" cx="208.71" cy="302.86" r="34.97" />
            <g id="NC-Nodes">
              <rect
                className="cls-6"
                x="157.71"
                y="258.03"
                width="68.6"
                height="6.04"
                transform="translate(-128.41 212.61) rotate(-45.07)"
              />
              <polygon
                className="cls-6"
                points="226.8 345.29 161.45 279.93 167.2 274.16 232.57 339.54 226.8 345.29"
              />
              <circle className="cls-9" cx="212.67" cy="241.1" r="12.06" />
              <circle className="cls-9" cx="170.39" cy="282.43" r="17.55" />
              <circle className="cls-9" cx="238.34" cy="350.32" r="26.35" />
            </g>
          </g>
          <path
            className="cls-7"
            d="M302.46,229H249.94a22.1,22.1,0,0,1-22.1-22.1V152.89Z"
          />
        </g>
      </svg>
    );
  }
}
