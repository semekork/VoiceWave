let _navigator;

function setTopLevelNavigator(navigatorRef) {
  _navigator = navigatorRef;
}

function navigate(routeName, params) {
  _navigator.navigate(routeName, params);
}

function goBack() {
  _navigator.goBack();
}

function reset(state) {
  _navigator.reset(state);
}

function canGoBack() {
  return _navigator.canGoBack();
}

export const NavigationService = {
  setTopLevelNavigator,
  navigate,
  goBack,
  reset,
  canGoBack,
};