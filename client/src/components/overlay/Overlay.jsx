import "./Overlay.css"
import PropTypes from "prop-types";

export default function Overlay({content="", onClose}) {
  return (
    <div className="overlay">
      <div className="overlay-content">
        {content}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

Overlay.propTypes = {
  content: PropTypes.element,
  onClose: PropTypes.func
};
