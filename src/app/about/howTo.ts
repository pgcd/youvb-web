export const HowTo = `
<p>To use YouVB, you just have to <a [routerLink]="['/treatments', 'new']">add a treatment plan</a> - 
enter a name for the area you're about to treat, a target exposure time in seconds
and the current phase of treatment (in case you are already at your target duration).</p>
<p>During the ramp-up phase, the time will be increased after every successful treatment administered on time, until you reach the target duration.<br/>
If, on the other hand, you miss a treatment for several days, the following exposure will be reduced, and the phase will return to ramp-up (even if you had already
reached the target).</p>
<p>
If the treatment is successful, you'll find the area clearing when you are around the target duration - according to the literature I could find,
it should take 20 to 30 treatments to see marked improvements (90% clearance). <br/>
When this happens, you should manually change the phase of the treatment to "Maintenance 1" (the next maintenance phases require no manual change).
</p>
<p>DISCLAIMER: Usage of UV lamps can have serious consequences and should only be done following your doctor's instructions.</p>
`;
