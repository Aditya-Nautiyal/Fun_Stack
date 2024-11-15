import "./Overlay.css";
import PropTypes from "prop-types";

export default function Overlay({
  content,
  onClose,
  headerTitle,
  buttonTitle,
}) {
  return (
    <div className="overlay">
      <div className="overlay-content">
        <div className="overlay-title">{headerTitle}</div>
        <div className="overlay-body">{content}</div>
        <button className="overlay-button" onClick={onClose}>
          {buttonTitle}
        </button>
      </div>
    </div>
  );
}

Overlay.propTypes = {
  content: PropTypes.element,
  onClose: PropTypes.func,
  buttonTitle: PropTypes.string,
  headerTitle: PropTypes.string,
};
