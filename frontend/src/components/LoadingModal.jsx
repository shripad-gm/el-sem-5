import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

/**
 * @typedef {'submit' | 'categorize'} AnimationType
 */

const ANIMATIONS = {
  submit: 'https://lottie.host/90b39b01-27f5-474f-a818-5ad312a88eee/uTzznEE9Is.lottie',
  categorize: 'https://lottie.host/08b6f1be-bcd1-4383-bfff-ab3184b3289e/NSzGU7wg24.lottie'
};

/**
 * LoadingModal component for displaying loading states with animations
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {string} [props.message] - Custom message to display
 * @param {AnimationType} [props.animationType='submit'] - Type of animation to show
 * @param {'sm'|'md'|'lg'} [props.size='lg'] - Size of the loading animation
 */
const LoadingModal = ({ 
  isOpen, 
  message,
  animationType = 'submit',
  size = 'lg'
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'w-24 h-24',      // 6rem x 6rem (96px x 96px)
    md: 'w-32 h-32',      // 8rem x 8rem (128px x 128px)
    lg: 'w-40 h-40'       // 10rem x 10rem (160px x 160px)
  };

  const defaultMessages = {
    submit: 'Submitting your post...',
    categorize: 'Analyzing your post...'
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '1rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '24rem',
        padding: '2rem',
        position: 'relative',
        zIndex: 10000
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%'
        }}>
          <div style={{
            width: size === 'sm' ? '8rem' : size === 'md' ? '10rem' : '12rem',
            height: size === 'sm' ? '8rem' : size === 'md' ? '10rem' : '12rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <DotLottieReact
              src={ANIMATIONS[animationType]}
              loop
              autoplay
              style={{
                width: '100%',
                height: '100%',
                display: 'block'
              }}
            />
          </div>
          <p style={{
            color: '#1f2937',
            fontWeight: 500,
            textAlign: 'center',
            marginTop: '1rem',
            fontSize: '1rem',
            lineHeight: '1.5'
          }}>
            {message || defaultMessages[animationType]}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingModal;
