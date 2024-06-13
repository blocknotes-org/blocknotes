# frozen_string_literal: true

ASC_API_KEY_ENV_VARS = %w[
  APP_STORE_CONNECT_API_KEY_KEY_ID
  APP_STORE_CONNECT_API_KEY_ISSUER_ID
  APP_STORE_CONNECT_API_KEY_KEY
].freeze

# Fastlane match also uses MATCH_PASSWORD, but we don't expect it to be set because when running locally folks my want to use the password-in-keychain workflow.
MATCH_ENV_VARS = %w[
  MATCH_S3_ACCESS_KEY
  MATCH_S3_SECRET_ACCESS_KEY
].freeze

# Use this to ensure all env vars a lane requires are set.
#
# The best place to call this is at the start of a lane, to fail early.
def require_env_vars!(*keys)
  keys.each { |key| get_required_env!(key) }
end

# Use this instead of getting values from `ENV` directly. It will throw an error if the requested value is missing.
def get_required_env!(key, env_file_path: USER_ENV_FILE_PATH)
  return ENV.fetch(key) if ENV.key?(key)

  message = "Environment variable '#{key}' is not set."

  if is_ci
    UI.user_error!(message)
  elsif File.exist?(env_file_path)
    UI.user_error!("#{message} Consider adding it to #{env_file_path}.")
  else
    env_file_example_path = 'fastlane/example.env'
    env_file_dir = File.dirname(env_file_path)
    env_file_name = File.basename(env_file_path)

    UI.user_error! <<~MSG
      #{env_file_name} not found in #{env_file_dir}!

      Please copy #{env_file_example_path} to #{env_file_path} and fill in the values for the automation you require.

      mkdir -p #{env_file_dir} && cp #{env_file_example_path} #{env_file_path}
    MSG
  end
end
