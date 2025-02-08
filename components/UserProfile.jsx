import React, { useState, useEffect } from 'react';
import { useOrbis } from "@orbisclub/components";
import { shortAddress, getTimestamp } from "../utils";
import { useDidToAddress } from "../hooks/useDidToAddress";
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { LoadingCircle, EditIcon } from "./Icons";
import UserCredentials from "./UserCredentials";
import { FaGithub, FaTwitter, FaGlobe, FaEthereum, FaHeart, FaComment, FaShare, FaTag, FaEllipsisH, FaTrophy } from 'react-icons/fa';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';
import Link from 'next/link';
import { POINTS_RULES } from '../config/points';

if (!TimeAgo.getDefaultLocale()) {
  TimeAgo.addDefaultLocale(en);
}

const timeAgo = new TimeAgo('en-US');

export default function UserProfile({ details, initialData }) {
  const { orbis, user } = useOrbis();
  const [profileImage, setProfileImage] = useState(details?.profile?.pfp || '/default-avatar.png');
  const [coverImage, setCoverImage] = useState(details?.profile?.cover || '/default-cover.jpg');
  const [nfts, setNfts] = useState([]);
  const [showNftSelector, setShowNftSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [donationStats, setDonationStats] = useState({
    totalReceived: 0,
    totalDonors: 0,
    recentDonations: []
  });
  const [userPoints, setUserPoints] = useState(0); // Initialize userPoints state

  const isOwnProfile = user?.did === details?.did;
  const { address } = useDidToAddress(details?.did);

  useEffect(() => {
    if (address) {
      loadNfts();
      loadDonationStats();
    }
  }, [address]);

  useEffect(() => {
    if (details?.did) {
      loadUserPoints();
    }
  }, [details]);

  async function loadUserPoints() {
    try {
      const { data: profile } = await orbis.getProfile(details.did);
      const points = profile?.details?.profile?.metadata?.points || 0;
      setUserPoints(points);
    } catch (error) {
      console.error('Error loading user points:', error);
    }
  }

  async function loadNfts() {
    try {
      const response = await fetch(`https://eth-mainnet.g.alchemy.com/nft/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}/getNFTs?owner=${address}`);
      const data = await response.json();
      setNfts(data.ownedNfts || []);
    } catch (error) {
      console.error("Error loading NFTs:", error);
    }
  }

  async function loadDonationStats() {
    try {
      const response = await fetch(`/api/donations/user/${address}`);
      const stats = await response.json();
      setDonationStats(stats);
    } catch (error) {
      console.error("Error loading donation stats:", error);
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Cover Image Section */}
      <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 overflow-hidden rounded-b-lg">
        <img
          src={coverImage}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        {isOwnProfile && (
          <label className="absolute bottom-4 right-4 bg-white rounded-full p-3 cursor-pointer shadow-lg hover:bg-gray-50 transition-colors">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e, 'cover')}
            />
            <EditIcon style={{ color: "#4B5563" }} />
          </label>
        )}
      </div>

      {/* Profile Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="p-6 sm:p-8">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div className="flex items-center">
                {/* Profile Image */}
                <div className="relative">
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white object-cover shadow-lg"
                  />
                  {isOwnProfile && (
                    <div className="absolute -bottom-2 -right-2 flex space-x-1">
                      <label className="bg-white rounded-full p-2 cursor-pointer shadow-lg hover:bg-gray-50 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, 'profile')}
                        />
                        <EditIcon style={{ color: "#4B5563" }} />
                      </label>
                      <button
                        onClick={() => setShowNftSelector(true)}
                        className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
                      >
                        <img src="/nft-icon.svg" alt="NFT" className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className="ml-6">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {details?.profile?.username || 'Anonymous'}
                  </h1>
                  <p className="text-sm text-gray-500">{shortAddress(details?.did)}</p>
                  {details?.profile?.description && (
                    <p className="mt-2 text-gray-600 max-w-2xl">
                      {details.profile.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-6 sm:mt-0 flex space-x-4">
                {details?.profile?.website && (
                  <a
                    href={details.profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <FaGlobe size={20} />
                  </a>
                )}
                {details?.profile?.twitter && (
                  <a
                    href={`https://twitter.com/${details.profile.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <FaTwitter size={20} />
                  </a>
                )}
                {details?.profile?.github && (
                  <a
                    href={`https://github.com/${details.profile.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <FaGithub size={20} />
                  </a>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center">
                  <FaEthereum className="text-blue-500 w-6 h-6" />
                  <span className="ml-2 text-2xl font-bold">{donationStats.totalReceived} ETH</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">Total Received</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center">
                  <span className="text-2xl font-bold">{donationStats.totalDonors}</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">Total Donors</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center">
                <span className="text-2xl font-bold">
                    {userPoints} 
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-500">Points</p>
              </div>
            </div>

            {/* Recent Donations */}
            {donationStats.recentDonations.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Donations</h3>
                <div className="space-y-3">
                  {donationStats.recentDonations.map((donation, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FaEthereum className="text-blue-500" />
                        <span className="text-sm font-medium">{shortAddress(donation.from)}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-sm font-medium">{donation.amount} ETH</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {timeAgo.format(donation.timestamp * 1000)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Credentials */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Credentials</h3>
              <UserCredentials details={details} />
            </div>

            {/* Posts */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Posts</h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {initialData?.posts?.map((post) => (
                  <Link href={`/post/${post.stream_id}`} key={post.stream_id}>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h4 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
                        {post.content.title}
                      </h4>
                      <div className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {parse(DOMPurify.sanitize(marked(post.content.body)))}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <FaHeart className="w-4 h-4 mr-1" />
                          {post.count_likes}
                        </span>
                        <span className="flex items-center">
                          <FaComment className="w-4 h-4 mr-1" />
                          {post.count_replies}
                        </span>
                        {post.donationAmount > 0 && (
                          <span className="flex items-center text-green-600">
                            <FaEthereum className="w-4 h-4 mr-1" />
                            {post.donationAmount}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}