import { useState } from 'react';
import { FaStar, FaRegHeart } from 'react-icons/fa';
import { MdOutlineGrade } from 'react-icons/md';
import { GiMountainClimbing } from 'react-icons/gi';
import Image from 'next/image';

interface SpotCardProps {
  spot: OSMSpot;
}

export const SpotCard: React.FC<SpotCardProps> = ({ spot }) => {
  const [imageError, setImageError] = useState(false);
  
  // Determine the image source with fallback
  const imageSource = !imageError && spot.tags.image_url 
    ? spot.tags.image_url 
    : `/images/${spot.tags.type}-placeholder.jpg`;

  return (
    <div className="flex gap-3 p-2 cursor-pointer hover:bg-gray-50 rounded-xl">
      {/* Image Container with Next.js Image optimization */}
      <div className="relative w-[120px] h-[120px] flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
        <Image
          src={imageSource}
          alt={spot.tags.name || "Climbing spot"}
          fill
          className="object-cover"
          sizes="120px"
          onError={() => setImageError(true)}
          priority={false}
          loading="lazy"
        />
        <button 
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white transition shadow-sm z-10"
          aria-label="Save to favorites"
        >
          <FaRegHeart className="w-4 h-4 text-gray-700" />
        </button>
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-grow py-1 min-w-0">
        {/* Header */}
        <div className="flex justify-between items-start gap-1">
          <h3 className="font-medium text-[15px] text-gray-800 truncate">
            {spot.tags.name || "Unnamed Spot"}
          </h3>
          {spot.tags.rating > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <FaStar className="w-3.5 h-3.5 text-airbnb-primary" />
              <span className="text-sm">{spot.tags.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Primary Info */}
        <div className="mt-1 flex flex-col gap-0.5 text-[14px] text-gray-500">
          {/* Type and Rock Type */}
          <div className="flex items-center gap-1.5">
            <GiMountainClimbing className="w-4 h-4" />
            <span className="capitalize truncate">
              {spot.tags.type}
              {spot.tags.rock_type && ` · ${spot.tags.rock_type}`}
            </span>
          </div>

          {/* Grade and Routes */}
          <div className="flex items-center gap-1.5">
            <MdOutlineGrade className="w-4 h-4" />
            <span className="truncate">
              {spot.tags.grade && `Grade ${spot.tags.grade}`}
              {spot.tags.number_of_routes && ` · ${spot.tags.number_of_routes} routes`}
            </span>
          </div>
        </div>

        {/* Additional Info */}
        {(spot.tags.protection || spot.tags.height || spot.tags.access) && (
          <div className="mt-1.5 text-[13px] text-gray-500">
            {spot.tags.protection && (
              <span className="inline-block mr-2 capitalize">
                {spot.tags.protection} protection
              </span>
            )}
            {spot.tags.height && (
              <span className="inline-block mr-2">
                {spot.tags.height}m high
              </span>
            )}
            {spot.tags.access && (
              <p className="mt-0.5 line-clamp-1 text-gray-400">
                {spot.tags.access}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 