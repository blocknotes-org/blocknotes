#!/bin/bash -eu

# Switch to the `ios/App` directory where the Gemfile and Podfile are located
cd ios/App

echo "--- :rubygems: Setting up Ruby gems"
install_gems

echo "--- :cocoapods: Setting up Pods"
install_cocoapods

# Switch back to the root directory after installing the Gems and Pods
cd -

echo "--- :node: Installing NPM Dependencies and Syncing Project"
npm ci
npm run build
npx cap sync

echo "--- :testflight: Build and upload to TestFlight"
bundle exec fastlane build_and_upload_to_testflight
