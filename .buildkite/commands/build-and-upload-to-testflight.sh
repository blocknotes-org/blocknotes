#!/bin/bash -eu

echo "--- :rubygems: Setting up Ruby gems"
install_gems

echo "--- :node: Installing NPM Dependencies and Syncing Project"
npm ci
npm run build
npx cap sync

echo "--- :testflight: Build and upload to TestFlight"
bundle exec fastlane build_and_upload_to_testflight
