import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const Loader = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1000
  }}>
    <DotLottieReact
      src="https://lottie.host/c0a952eb-a9fe-49f0-afe5-66052ccb01df/TueB10JBvW.lottie"
      loop
      autoplay
      style={{ 
        width: '200px', 
        height: '200px',
        margin: 'auto'
      }}
    />
  </div>
);

export default Loader;
