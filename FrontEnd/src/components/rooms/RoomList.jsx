import React from 'react';
import RoomListItem from './RoomListItem';

const RoomList = ({ rooms }) => {
  if (rooms.length === 0) {
    return (
      <div className="text-center py-20 text-neutral-400 font-light">
        No rooms found in this category.
      </div>
    );
  }

  return (
    <div className="max-w-[1152px] mx-auto px-4 lg:px-0 pb-20">
      <div className="flex flex-col gap-10">
        {rooms.map((room) => (
          <RoomListItem key={room._id} room={room} />
        ))}
      </div>
    </div>
  );
};

export default RoomList;