#!/usr/bin/env bash
./parallel-mocha \
  --cwd $GAIA \
  --format "./node_modules/.bin/marionette-mocha --timeout 60s --ui tdd --profile-builder $GAIA/shared/test/integration/profile_builder.js --profile-base $GAIA/shared/test/integration/profile.js ./shared/test/integration/setup.js %s" \
  --tasks "$GAIA/apps/communications/dialer/test/marionette/navigation_test.js $GAIA/apps/communications/dialer/test/marionette/keypad_test.js $GAIA/apps/communications/contacts/test/marionette/search_test.js $GAIA/apps/communications/contacts/test/marionette/form_test.js $GAIA/apps/communications/contacts/test/marionette/details_test.js $GAIA/apps/communications/contacts/test/marionette/activities_test.js $GAIA/apps/settings/test/marionette/tests/notifications_settings_test.js $GAIA/apps/settings/test/marionette/tests/hotspot_wifi_settings_test.js $GAIA/apps/settings/test/marionette/tests/sound_settings_test.js $GAIA/apps/settings/test/marionette/tests/do_not_track_settings_test.js $GAIA/apps/settings/test/marionette/tests/improve_settings_test.js $GAIA/apps/settings/test/marionette/tests/battery_settings_test.js $GAIA/apps/settings/test/marionette/tests/support_settings_test.js $GAIA/apps/settings/test/marionette/tests/bluetooth_settings_test.js $GAIA/apps/sms/test/marionette/phone_number_service_test.js $GAIA/apps/clock/test/marionette/timer_start_test.js $GAIA/apps/clock/test/marionette/alarm_interaction_test.js $GAIA/apps/clock/test/marionette/stopwatch_lap_test.js $GAIA/apps/clock/test/marionette/stopwatch_advancement_test.js $GAIA/apps/clock/test/marionette/timer_restart_test.js $GAIA/apps/clock/test/marionette/clock_interaction_test.js $GAIA/apps/clock/test/marionette/stopwatch_reset_test.js $GAIA/apps/calendar/test/marionette/today_test.js $GAIA/apps/calendar/test/marionette/day_view_test.js $GAIA/apps/calendar/test/marionette/week_view_test.js $GAIA/apps/calendar/test/marionette/create_event_test.js $GAIA/apps/system/test/marionette/notification_get_test.js $GAIA/apps/system/test/marionette/lockscreen_disabled_test.js $GAIA/apps/system/test/marionette/net_error_test.js $GAIA/apps/system/test/marionette/media_playback_test.js $GAIA/apps/system/test/marionette/fullscreen_statusbar_test.js $GAIA/apps/system/test/marionette/edges_gesture_test.js $GAIA/apps/system/test/marionette/notification_test.js $GAIA/apps/system/test/marionette/fullscreen_app_alert_test.js $GAIA/apps/browser/test/marionette/awesomescreen_test.js $GAIA/apps/browser/test/marionette/settings_test.js $GAIA/apps/browser/test/marionette/share_url_test.js $GAIA/apps/browser/test/marionette/contextmenu_test.js $GAIA/apps/browser/test/marionette/navigate_test.js $GAIA/apps/homescreen/test/marionette/install_bookmark_test.js $GAIA/apps/search/test/marionette/contacts_search_test.js $GAIA/apps/search/test/marionette/navigation_test.js $GAIA/apps/search/test/marionette/places_search_test.js $GAIA/apps/search/test/marionette/app_search_test.js $GAIA/apps/video/test/marionette/overlay_test.js $GAIA/apps/video/test/marionette/video_list_test.js $GAIA/apps/gallery/test/marionette/delete_image_test.js $GAIA/apps/gallery/test/marionette/fullscreen_image_test.js $GAIA/apps/gallery/test/marionette/edit_image_test.js"
