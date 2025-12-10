import React from 'react'

const AnimatedBackground = () => {
  // Generate random positions and delays for birds and butterflies
  const birds = Array.from({ length: 3 }, (_, i) => ({
    id: `bird-${i}`,
    startX: Math.random() * 100,
    startY: Math.random() * 50 + 10,
    duration: 15 + Math.random() * 10,
    delay: Math.random() * 5,
    size: 20 + Math.random() * 15
  }))

  const butterflies = Array.from({ length: 4 }, (_, i) => ({
    id: `butterfly-${i}`,
    startX: Math.random() * 100,
    startY: Math.random() * 60 + 20,
    duration: 20 + Math.random() * 15,
    delay: Math.random() * 8,
    size: 15 + Math.random() * 10
  }))

  // Generate random positions and delays for clouds
  const clouds = Array.from({ length: 5 }, (_, i) => ({
    id: `cloud-${i}`,
    startX: Math.random() * 120 - 20, // Start off-screen or on-screen
    startY: Math.random() * 40 + 5, // Top portion of screen
    duration: 30 + Math.random() * 40, // Slower movement for clouds
    delay: Math.random() * 10,
    size: 40 + Math.random() * 60, // Larger clouds
    opacity: 0.4 + Math.random() * 0.4 // Varying opacity
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <style>{`
        @keyframes fly-across {
          0% {
            transform: translateX(-10%) translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(110%) translateY(-20px) rotate(5deg);
            opacity: 0;
          }
        }

        @keyframes fly-across-reverse {
          0% {
            transform: translateX(110%) translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(-10%) translateY(20px) rotate(-5deg);
            opacity: 0;
          }
        }

        @keyframes butterfly-float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-15px) rotate(5deg);
          }
          50% {
            transform: translateY(-5px) rotate(0deg);
          }
          75% {
            transform: translateY(-20px) rotate(-5deg);
          }
        }

        @keyframes butterfly-fly {
          0% {
            transform: translateX(-10%) translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateX(110%) translateY(-30px) rotate(10deg);
            opacity: 0;
          }
        }

        @keyframes cloud-drift {
          0% {
            transform: translateX(-20%) translateY(0);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          95% {
            opacity: 1;
          }
          100% {
            transform: translateX(120%) translateY(0);
            opacity: 0;
          }
        }

        @keyframes cloud-drift-reverse {
          0% {
            transform: translateX(120%) translateY(0);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          95% {
            opacity: 1;
          }
          100% {
            transform: translateX(-20%) translateY(0);
            opacity: 0;
          }
        }

        @keyframes cloud-float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .bird {
          animation: fly-across linear infinite;
        }

        .bird-reverse {
          animation: fly-across-reverse linear infinite;
        }

        .butterfly {
          animation: butterfly-fly linear infinite, butterfly-float 3s ease-in-out infinite;
        }

        .cloud {
          animation: cloud-drift linear infinite, cloud-float 8s ease-in-out infinite;
        }

        .cloud-reverse {
          animation: cloud-drift-reverse linear infinite, cloud-float 8s ease-in-out infinite;
        }
      `}</style>

      {/* Birds */}
      {birds.map((bird, index) => (
        <div
          key={bird.id}
          className={`absolute ${index % 2 === 0 ? 'bird' : 'bird-reverse'}`}
          style={{
            left: `${bird.startX}%`,
            top: `${bird.startY}%`,
            fontSize: `${bird.size}px`,
            animationDuration: `${bird.duration}s`,
            animationDelay: `${bird.delay}s`
          }}
        >
          <svg
            width={bird.size}
            height={bird.size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
          >
            <path
              d="M12 2C8 2 5 5 5 9C5 11.5 6.5 13.5 8.5 14.5C7.5 15.5 6 17 6 19C6 21 8 23 10 23C11 23 12 22.5 12.5 21.5C13 22.5 14 23 15 23C17 23 19 21 19 19C19 17 17.5 15.5 16.5 14.5C18.5 13.5 20 11.5 20 9C20 5 17 2 13 2C12.7 2 12.3 2 12 2Z"
              fill="#4A5568"
              opacity="0.7"
            />
            <path
              d="M9 8C9.5 8 10 8.5 10 9C10 9.5 9.5 10 9 10C8.5 10 8 9.5 8 9C8 8.5 8.5 8 9 8Z"
              fill="#1A202C"
            />
            <path
              d="M15 8C15.5 8 16 8.5 16 9C16 9.5 15.5 10 15 10C14.5 10 14 9.5 14 9C14 8.5 14.5 8 15 8Z"
              fill="#1A202C"
            />
          </svg>
        </div>
      ))}

      {/* Butterflies */}
      {butterflies.map((butterfly, index) => (
        <div
          key={butterfly.id}
          className="butterfly absolute"
          style={{
            left: `${butterfly.startX}%`,
            top: `${butterfly.startY}%`,
            fontSize: `${butterfly.size}px`,
            animationDuration: `${butterfly.duration}s`,
            animationDelay: `${butterfly.delay}s`
          }}
        >
          <svg
            width={butterfly.size}
            height={butterfly.size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}
          >
            {/* Butterfly body */}
            <ellipse cx="12" cy="12" rx="1.5" ry="8" fill="#2D3748" opacity="0.8" />
            {/* Left upper wing */}
            <path
              d="M12 8C10 6 7 6 5 8C5 10 7 12 9 12C10 12 11 11 12 10C12 9 12 8 12 8Z"
              fill="#E53E3E"
              opacity="0.7"
            />
            <path
              d="M12 8C10 6 7 6 5 8C5 9 6 10 7 10C8 10 9 9 10 8C10 8 11 8 12 8Z"
              fill="#F56565"
              opacity="0.5"
            />
            {/* Right upper wing */}
            <path
              d="M12 8C14 6 17 6 19 8C19 10 17 12 15 12C14 12 13 11 12 10C12 9 12 8 12 8Z"
              fill="#3182CE"
              opacity="0.7"
            />
            <path
              d="M12 8C14 6 17 6 19 8C19 9 18 10 17 10C16 10 15 9 14 8C14 8 13 8 12 8Z"
              fill="#4299E1"
              opacity="0.5"
            />
            {/* Left lower wing */}
            <path
              d="M12 16C10 18 7 18 5 16C5 14 7 12 9 12C10 12 11 13 12 14C12 15 12 16 12 16Z"
              fill="#E53E3E"
              opacity="0.7"
            />
            {/* Right lower wing */}
            <path
              d="M12 16C14 18 17 18 19 16C19 14 17 12 15 12C14 12 13 13 12 14C12 15 12 16 12 16Z"
              fill="#3182CE"
              opacity="0.7"
            />
            {/* Decorative spots */}
            <circle cx="7" cy="9" r="1" fill="#F7FAFC" opacity="0.6" />
            <circle cx="17" cy="9" r="1" fill="#F7FAFC" opacity="0.6" />
          </svg>
        </div>
      ))}

      {/* Clouds */}
      {clouds.map((cloud, index) => (
        <div
          key={cloud.id}
          className={`absolute ${index % 2 === 0 ? 'cloud' : 'cloud-reverse'}`}
          style={{
            left: `${cloud.startX}%`,
            top: `${cloud.startY}%`,
            width: `${cloud.size}px`,
            height: `${cloud.size * 0.6}px`,
            animationDuration: `${cloud.duration}s`,
            animationDelay: `${cloud.delay}s`,
            opacity: cloud.opacity
          }}
        >
          <svg
            width={cloud.size}
            height={cloud.size * 0.6}
            viewBox="0 0 100 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Fluffy cloud shape */}
            <ellipse cx="25" cy="30" rx="20" ry="15" fill="white" />
            <ellipse cx="40" cy="25" rx="25" ry="18" fill="white" />
            <ellipse cx="60" cy="30" rx="22" ry="16" fill="white" />
            <ellipse cx="75" cy="25" rx="18" ry="12" fill="white" />
            <ellipse cx="50" cy="35" rx="20" ry="14" fill="white" />
            {/* Soft shadow for depth */}
            <ellipse cx="40" cy="28" rx="25" ry="18" fill="white" opacity="0.3" />
          </svg>
        </div>
      ))}
    </div>
  )
}

export default AnimatedBackground

