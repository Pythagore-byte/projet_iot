
difference() {
    cylinder(h=35, r=5);
    translate([0,0,-2])cylinder(h=40, r=3);
}

difference() {
 translate([0,0,-10]) cylinder(h=10, r1=0 , r2=5);
 translate([0,0,-8]) cylinder(h=10, r1=0 , r2=5);
}

difference() {
    minkowski() {
        translate([0, 0, 40.5]) cube([27, 27, 11], center = true);
        sphere(r=1);                      
    }
    translate([0, 0, 46]) cube([16.5, 16.5, 3], center = true);
    translate([0, 0, 43]) cylinder(h=4, r=2, center = true);
    translate([-8.25, -11, 36]) cube([25, 16.5, 7], center = false);
    translate([-8.25, 8, 36]) cube([16.5, 8.5, 7], center = false);
    rotate([90, 0, 0]) translate([0, 39.5, -9]) cylinder(h=4, r=2); 
}
 



