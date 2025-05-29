import { CommonActions, StackActions } from '@react-navigation/native';

export class NavigationService {
  static navigator = null;

  static setTopLevelNavigator(navigatorRef) {
    this.navigator = navigatorRef;
  }

  static navigate(routeName, params = {}) {
    if (this.navigator) {
      this.navigator.navigate(routeName, params);
    }
  }

  static push(routeName, params = {}) {
    if (this.navigator) {
      this.navigator.dispatch(StackActions.push(routeName, params));
    }
  }

  static pop(count = 1) {
    if (this.navigator) {
      this.navigator.dispatch(StackActions.pop(count));
    }
  }

  static reset(routeName, params = {}) {
    if (this.navigator) {
      this.navigator.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: routeName, params }],
        })
      );
    }
  }

  static goBack() {
    if (this.navigator) {
      this.navigator.goBack();
    }
  }

  static getCurrentRoute() {
    if (this.navigator) {
      return this.navigator.getCurrentRoute();
    }
    return null;
  }

  static canGoBack() {
    if (this.navigator) {
      return this.navigator.canGoBack();
    }
    return false;
  }

  static getState() {
    if (this.navigator) {
      return this.navigator.getState();
    }
    return null;
  }
}