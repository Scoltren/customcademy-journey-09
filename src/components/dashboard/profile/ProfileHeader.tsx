
import React from 'react';

interface ProfileHeaderProps {
  title: string;
}

const ProfileHeader = ({ title }: ProfileHeaderProps) => {
  return (
    <h1 className="heading-lg mb-6">{title}</h1>
  );
};

export default ProfileHeader;
