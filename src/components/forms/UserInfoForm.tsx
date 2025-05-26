import React, { useState } from 'react';
import { UserInfo } from '../../types';

interface UserInfoFormProps {
  userInfo: UserInfo;
  validationErrors: Record<string, string>;
  onUserInfoChange: (updatedInfo: UserInfo) => void;
  bracketError?: string;
}

export const UserInfoForm: React.FC<UserInfoFormProps> = ({
  userInfo,
  validationErrors,
  onUserInfoChange,
  bracketError
}) => {
  const [hasSpecialChars, setHasSpecialChars] = useState<boolean>(false);

  const containsNumbersOrHash = (str: string): boolean => {
    return /[0-9#]/.test(str);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    onUserInfoChange({ ...userInfo, [name]: value });

    if ((name === "firstName" || name === "lastName") && containsNumbersOrHash(value)) {
      setHasSpecialChars(true);
    } else if (name === "firstName" || name === "lastName") {
      const firstNameHasSpecial = name === "firstName" 
        ? containsNumbersOrHash(value)
        : containsNumbersOrHash(userInfo.firstName);
      const lastNameHasSpecial = name === "lastName"
        ? containsNumbersOrHash(value)
        : containsNumbersOrHash(userInfo.lastName);
      setHasSpecialChars(firstNameHasSpecial || lastNameHasSpecial);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Your Information</h2>
      
      {bracketError && (
        <div className="p-3 mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
          <p>{bracketError}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-4">
        <div className="flex flex-wrap md:flex-nowrap gap-4">
          <div className="w-full md:w-1/2">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={userInfo.firstName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md ${
                validationErrors.firstName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {validationErrors.firstName && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.firstName}</p>
            )}
          </div>
          
          <div className="w-full md:w-1/2">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={userInfo.lastName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md ${
                validationErrors.lastName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {validationErrors.lastName && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.lastName}</p>
            )}
          </div>
        </div>

        {hasSpecialChars && (
          <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded">
            <p>
              We'll automatically number your entries if you submit multiple brackets. 
              No need to add numbers or special characters to your name.
            </p>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={userInfo.email}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md ${
              validationErrors.email ? "border-red-500" : "border-gray-300"
            }`}
          />
          {validationErrors.email && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
            Who told you about this pool? Only necessary if you don't know Kyle.
          </label>
          <input
            type="text"
            id="contact"
            name="contact"
            value={userInfo.contact}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md ${
              validationErrors.contact ? "border-red-500" : "border-gray-300"
            }`}
          />
          {validationErrors.contact && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.contact}</p>
          )}
        </div>
      </div>
    </div>
  );
};