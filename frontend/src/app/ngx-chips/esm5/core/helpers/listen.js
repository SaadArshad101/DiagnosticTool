/**
 * @name listen
 * @param listenerType
 * @param action
 * @param condition
 */
export function listen(listenerType, action, condition) {
    if (condition === void 0) { condition = true; }
    // if the event provided does not exist, throw an error
    if (!this.listeners.hasOwnProperty(listenerType)) {
        throw new Error('The event entered may be wrong');
    }
    // if a condition is present and is false, exit early
    if (!condition) {
        return;
    }
    // fire listener
    this.listeners[listenerType].push(action);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdGVuLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmd4LWNoaXBzLyIsInNvdXJjZXMiOlsiY29yZS9oZWxwZXJzL2xpc3Rlbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQTs7Ozs7R0FLRztBQUNILE1BQU0sVUFBVSxNQUFNLENBQUMsWUFBb0IsRUFBRSxNQUFpQixFQUFFLFNBQWdCO0lBQWhCLDBCQUFBLEVBQUEsZ0JBQWdCO0lBQzVFLHVEQUF1RDtJQUN2RCxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLEVBQUU7UUFDOUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO0tBQ3JEO0lBRUQscURBQXFEO0lBQ3JELElBQUksQ0FBQyxTQUFTLEVBQUU7UUFDWixPQUFPO0tBQ1Y7SUFFRCxnQkFBZ0I7SUFDaEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDOUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIlxuLyoqXG4gKiBAbmFtZSBsaXN0ZW5cbiAqIEBwYXJhbSBsaXN0ZW5lclR5cGVcbiAqIEBwYXJhbSBhY3Rpb25cbiAqIEBwYXJhbSBjb25kaXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxpc3RlbihsaXN0ZW5lclR5cGU6IHN0cmluZywgYWN0aW9uOiAoKSA9PiBhbnksIGNvbmRpdGlvbiA9IHRydWUpOiB2b2lkIHtcbiAgICAvLyBpZiB0aGUgZXZlbnQgcHJvdmlkZWQgZG9lcyBub3QgZXhpc3QsIHRocm93IGFuIGVycm9yXG4gICAgaWYgKCF0aGlzLmxpc3RlbmVycy5oYXNPd25Qcm9wZXJ0eShsaXN0ZW5lclR5cGUpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIGV2ZW50IGVudGVyZWQgbWF5IGJlIHdyb25nJyk7XG4gICAgfVxuXG4gICAgLy8gaWYgYSBjb25kaXRpb24gaXMgcHJlc2VudCBhbmQgaXMgZmFsc2UsIGV4aXQgZWFybHlcbiAgICBpZiAoIWNvbmRpdGlvbikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gZmlyZSBsaXN0ZW5lclxuICAgIHRoaXMubGlzdGVuZXJzW2xpc3RlbmVyVHlwZV0ucHVzaChhY3Rpb24pO1xufVxuIl19