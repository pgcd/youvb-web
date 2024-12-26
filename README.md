# YouVB: UVB phototherapy helper

I created this as an app back in 2016 (it was briefly available on the Play Store) because I needed to track phototherapy treatments on a bunch of different spots, and the spreadsheet was ludicrously unwieldy.
When I no longer needed it, I basically forgot about it, and left it to rot with code stuck around Ionic 3.9/Angular 4.0 (also because Google had made some changes to Android after my original 4.2 target, and I didn't want to deal with those).

Fast forward eight years: I recently found myself with some time to kill and decided that, as it was useful to me back in the day, other Psoriasis sufferers may benefit from this, and it would be perfectly fine to run it in the browser rather than as a native(-ish) app. So I went about updating all the libraries to a more recent version and found that literally nothing worked anymore (way too many changes).  
Eventually, I had to rewrite almost everything to use the current idioms (looking at you, ngrx) but that was good exercise, so here we are.

Worth pointing out that the code is definitely not great, since my main objective for this first step was simply to enable the app to work, rather than show off my talent - as a result, I didn't use almost any of the improvements that came to Angular after my initial version, and there are still bits and pieces that used to work in the Android app and that haven't made it yet to this web-based implementation.

You can find the "release" version at https://youvb.skin.
