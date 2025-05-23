import cx from 'classnames';
import { ChevronUp as ExpandLessIcon } from 'lucide-react';
import { motion } from 'motion/react';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { Modal } from '~/lib/ui/components';
import CloseButton from '../components/CloseButton';

/**
 * Renders a modal window.
 */

const Overlay = (props) => {
  const {
    children,
    onClose,
    onBlur,
    show,
    title,
    footer,
    fullheight = false,
    fullscreen: fullscreenProp,
    forceDisableFullscreen = false,
    forceEnableFullscreen = false,
    allowMaximize = true,
    className,
    style,
  } = props;

  // Start full screen if forceEnableFullScreen prop,
  // or user preference is for full screen forms, or we have the full screen prop,
  // UNLESS we have the forceDisableFullscreen prop
  const startFullscreen = useMemo(
    () => forceEnableFullscreen || (!forceDisableFullscreen && fullscreenProp),
    [forceEnableFullscreen, forceDisableFullscreen, fullscreenProp],
  );

  const [fullscreen, setFullscreen] = useState(startFullscreen);

  useEffect(() => {
    if (fullscreen !== startFullscreen) {
      setFullscreen(startFullscreen);
    }
  }, [startFullscreen, fullscreen]);

  const overlayClasses = cx(
    'overlay',
    { 'overlay--fullheight': fullheight },
    { 'overlay--fullscreen': fullscreen },
    className,
  );

  const handleFullScreenChange = () => {
    setFullscreen(!fullscreen);
  };

  return (
    <Modal show={show} onBlur={onBlur}>
      <article style={{ ...style }} className={overlayClasses}>
        {title && (
          <header className="overlay__title">
            {allowMaximize &&
              !forceDisableFullscreen &&
              !forceEnableFullscreen && (
                <motion.div
                  style={{ cursor: 'pointer', display: 'flex' }}
                  onClick={handleFullScreenChange}
                  animate={!fullscreen ? { rotate: 0 } : { rotate: 180 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ExpandLessIcon style={{ fontSize: '4rem' }} />
                </motion.div>
              )}
            <h1>{title}</h1>
            <CloseButton className="overlay__close" onClick={onClose} />
          </header>
        )}
        <main className="overlay__content">{children}</main>
        {footer && <footer className="overlay__footer">{footer}</footer>}
      </article>
    </Modal>
  );
};

Overlay.propTypes = {
  onClose: PropTypes.func,
  onBlur: PropTypes.func,
  title: PropTypes.string,
  show: PropTypes.bool,
  children: PropTypes.any,
  footer: PropTypes.any,
  fullheight: PropTypes.bool,
  forceDisableFullscreen: PropTypes.bool,
  forceEnableFullscreen: PropTypes.bool,
  allowMaximize: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default Overlay;
