import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
import { DRAG_AND_DROP_KEY } from '../../core/constants';
let DragProvider = class DragProvider {
    constructor() {
        this.state = {
            dragging: false,
            dropping: false,
            index: undefined
        };
    }
    /**
     * @name setDraggedItem
     * @param event
     * @param tag
     */
    setDraggedItem(event, tag) {
        if (event && event.dataTransfer) {
            event.dataTransfer.setData(DRAG_AND_DROP_KEY, JSON.stringify(tag));
        }
    }
    /**
     * @name getDraggedItem
     * @param event
     */
    getDraggedItem(event) {
        if (event && event.dataTransfer) {
            const data = event.dataTransfer.getData(DRAG_AND_DROP_KEY);
            try {
                return JSON.parse(data);
            }
            catch (_a) {
                return;
            }
        }
    }
    /**
     * @name setSender
     * @param sender
     */
    setSender(sender) {
        this.sender = sender;
    }
    /**
     * @name setReceiver
     * @param receiver
     */
    setReceiver(receiver) {
        this.receiver = receiver;
    }
    /**
     * @name onTagDropped
     * @param tag
     * @param indexDragged
     * @param indexDropped
     */
    onTagDropped(tag, indexDragged, indexDropped) {
        this.onDragEnd();
        this.sender.onRemoveRequested(tag, indexDragged);
        this.receiver.onAddingRequested(false, tag, indexDropped);
    }
    /**
     * @name setState
     * @param state
     */
    setState(state) {
        this.state = Object.assign({}, this.state, state);
    }
    /**
     * @name getState
     * @param key
     */
    getState(key) {
        return key ? this.state[key] : this.state;
    }
    /**
     * @name onDragEnd
     */
    onDragEnd() {
        this.setState({
            dragging: false,
            dropping: false,
            index: undefined
        });
    }
};
DragProvider = tslib_1.__decorate([
    Injectable()
], DragProvider);
export { DragProvider };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhZy1wcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiJuZzovL25neC1jaGlwcy8iLCJzb3VyY2VzIjpbImNvcmUvcHJvdmlkZXJzL2RyYWctcHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUdBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFRM0MsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFXekQsSUFBYSxZQUFZLEdBQXpCLE1BQWEsWUFBWTtJQUR6QjtRQUtXLFVBQUssR0FBVTtZQUNsQixRQUFRLEVBQUUsS0FBSztZQUNmLFFBQVEsRUFBRSxLQUFLO1lBQ2YsS0FBSyxFQUFFLFNBQVM7U0FDbkIsQ0FBQztJQW1GTixDQUFDO0lBakZHOzs7O09BSUc7SUFDSSxjQUFjLENBQUMsS0FBZ0IsRUFBRSxHQUFlO1FBQ25ELElBQUksS0FBSyxJQUFJLEtBQUssQ0FBQyxZQUFZLEVBQUU7WUFDN0IsS0FBSyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQ3RFO0lBQ0wsQ0FBQztJQUVEOzs7T0FHRztJQUNJLGNBQWMsQ0FBQyxLQUFnQjtRQUNsQyxJQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsWUFBWSxFQUFFO1lBQzdCLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDM0QsSUFBSTtnQkFDQSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFlLENBQUM7YUFDekM7WUFBQyxXQUFNO2dCQUNKLE9BQU87YUFDVjtTQUNKO0lBQ0wsQ0FBQztJQUVEOzs7T0FHRztJQUNJLFNBQVMsQ0FBQyxNQUF5QjtRQUN0QyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUN6QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksV0FBVyxDQUFDLFFBQTJCO1FBQzFDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0lBQzdCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNJLFlBQVksQ0FBQyxHQUFhLEVBQUUsWUFBb0IsRUFBRSxZQUFxQjtRQUMxRSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFFakIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFFRDs7O09BR0c7SUFDSSxRQUFRLENBQUMsS0FBMEM7UUFDdEQsSUFBSSxDQUFDLEtBQUsscUJBQVEsSUFBSSxDQUFDLEtBQUssRUFBSyxLQUFLLENBQUUsQ0FBQztJQUM3QyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksUUFBUSxDQUFDLEdBQW1CO1FBQy9CLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQzlDLENBQUM7SUFFRDs7T0FFRztJQUNJLFNBQVM7UUFDWixJQUFJLENBQUMsUUFBUSxDQUFDO1lBQ1YsUUFBUSxFQUFFLEtBQUs7WUFDZixRQUFRLEVBQUUsS0FBSztZQUNmLEtBQUssRUFBRSxTQUFTO1NBQ25CLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSixDQUFBO0FBM0ZZLFlBQVk7SUFEeEIsVUFBVSxFQUFFO0dBQ0EsWUFBWSxDQTJGeEI7U0EzRlksWUFBWSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFRhZ0lucHV0Q29tcG9uZW50IH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy90YWctaW5wdXQvdGFnLWlucHV0JztcbmltcG9ydCB7IFRhZ01vZGVsIH0gZnJvbSAnLi4vYWNjZXNzb3InO1xuXG5pbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmV4cG9ydCBkZWNsYXJlIGludGVyZmFjZSBEcmFnZ2VkVGFnIHtcbiAgICBpbmRleDogbnVtYmVyO1xuICAgIHRhZzogVGFnTW9kZWw7XG4gICAgem9uZTogc3RyaW5nO1xufVxuXG5pbXBvcnQgeyBEUkFHX0FORF9EUk9QX0tFWSB9IGZyb20gJy4uLy4uL2NvcmUvY29uc3RhbnRzJztcblxuZXhwb3J0IGRlY2xhcmUgaW50ZXJmYWNlIFN0YXRlIHtcbiAgICBkcmFnZ2luZzogYm9vbGVhbjtcbiAgICBkcm9wcGluZzogYm9vbGVhbjtcbiAgICBpbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZGVjbGFyZSB0eXBlIFN0YXRlUHJvcGVydHkgPSBrZXlvZiBTdGF0ZTtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIERyYWdQcm92aWRlciB7XG4gICAgcHVibGljIHNlbmRlcjogVGFnSW5wdXRDb21wb25lbnQ7XG4gICAgcHVibGljIHJlY2VpdmVyOiBUYWdJbnB1dENvbXBvbmVudDtcblxuICAgIHB1YmxpYyBzdGF0ZTogU3RhdGUgPSB7XG4gICAgICAgIGRyYWdnaW5nOiBmYWxzZSxcbiAgICAgICAgZHJvcHBpbmc6IGZhbHNlLFxuICAgICAgICBpbmRleDogdW5kZWZpbmVkXG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEBuYW1lIHNldERyYWdnZWRJdGVtXG4gICAgICogQHBhcmFtIGV2ZW50XG4gICAgICogQHBhcmFtIHRhZ1xuICAgICAqL1xuICAgIHB1YmxpYyBzZXREcmFnZ2VkSXRlbShldmVudDogRHJhZ0V2ZW50LCB0YWc6IERyYWdnZWRUYWcpOiB2b2lkIHtcbiAgICAgICAgaWYgKGV2ZW50ICYmIGV2ZW50LmRhdGFUcmFuc2Zlcikge1xuICAgICAgICAgICAgZXZlbnQuZGF0YVRyYW5zZmVyLnNldERhdGEoRFJBR19BTkRfRFJPUF9LRVksIEpTT04uc3RyaW5naWZ5KHRhZykpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG5hbWUgZ2V0RHJhZ2dlZEl0ZW1cbiAgICAgKiBAcGFyYW0gZXZlbnRcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0RHJhZ2dlZEl0ZW0oZXZlbnQ6IERyYWdFdmVudCk6IERyYWdnZWRUYWcgfCB1bmRlZmluZWQge1xuICAgICAgICBpZiAoZXZlbnQgJiYgZXZlbnQuZGF0YVRyYW5zZmVyKSB7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gZXZlbnQuZGF0YVRyYW5zZmVyLmdldERhdGEoRFJBR19BTkRfRFJPUF9LRVkpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShkYXRhKSBhcyBEcmFnZ2VkVGFnO1xuICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG5hbWUgc2V0U2VuZGVyXG4gICAgICogQHBhcmFtIHNlbmRlclxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRTZW5kZXIoc2VuZGVyOiBUYWdJbnB1dENvbXBvbmVudCk6IHZvaWQge1xuICAgICAgICB0aGlzLnNlbmRlciA9IHNlbmRlcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbmFtZSBzZXRSZWNlaXZlclxuICAgICAqIEBwYXJhbSByZWNlaXZlclxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRSZWNlaXZlcihyZWNlaXZlcjogVGFnSW5wdXRDb21wb25lbnQpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5yZWNlaXZlciA9IHJlY2VpdmVyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBuYW1lIG9uVGFnRHJvcHBlZFxuICAgICAqIEBwYXJhbSB0YWdcbiAgICAgKiBAcGFyYW0gaW5kZXhEcmFnZ2VkXG4gICAgICogQHBhcmFtIGluZGV4RHJvcHBlZFxuICAgICAqL1xuICAgIHB1YmxpYyBvblRhZ0Ryb3BwZWQodGFnOiBUYWdNb2RlbCwgaW5kZXhEcmFnZ2VkOiBudW1iZXIsIGluZGV4RHJvcHBlZD86IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLm9uRHJhZ0VuZCgpO1xuXG4gICAgICAgIHRoaXMuc2VuZGVyLm9uUmVtb3ZlUmVxdWVzdGVkKHRhZywgaW5kZXhEcmFnZ2VkKTtcbiAgICAgICAgdGhpcy5yZWNlaXZlci5vbkFkZGluZ1JlcXVlc3RlZChmYWxzZSwgdGFnLCBpbmRleERyb3BwZWQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBuYW1lIHNldFN0YXRlXG4gICAgICogQHBhcmFtIHN0YXRlXG4gICAgICovXG4gICAgcHVibGljIHNldFN0YXRlKHN0YXRlOiB7IFtLIGluIFN0YXRlUHJvcGVydHldPzogU3RhdGVbS10gfSk6IHZvaWQge1xuICAgICAgICB0aGlzLnN0YXRlID0geyAuLi50aGlzLnN0YXRlLCAuLi5zdGF0ZSB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBuYW1lIGdldFN0YXRlXG4gICAgICogQHBhcmFtIGtleVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRTdGF0ZShrZXk/OiBTdGF0ZVByb3BlcnR5KTogU3RhdGUgfCBTdGF0ZVtTdGF0ZVByb3BlcnR5XSB7XG4gICAgICAgIHJldHVybiBrZXkgPyB0aGlzLnN0YXRlW2tleV0gOiB0aGlzLnN0YXRlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBuYW1lIG9uRHJhZ0VuZFxuICAgICAqL1xuICAgIHB1YmxpYyBvbkRyYWdFbmQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZHJhZ2dpbmc6IGZhbHNlLFxuICAgICAgICAgICAgZHJvcHBpbmc6IGZhbHNlLFxuICAgICAgICAgICAgaW5kZXg6IHVuZGVmaW5lZFxuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=